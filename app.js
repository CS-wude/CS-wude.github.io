Ractive.DEBUG = false;
function index(page){
    var page = parseInt(page) || 1;
    window._G = window._G || {post: {}, postList: {}};
    $('title').html(_config['blog_name']);
    if(_G.postList[page] != undefined){
      $('#container').html(_G.postList[page]);
      return;
    }
        $.ajax({
                   url:"https://api.github.com/repos/"+_config['owner']+"/"+_config['repo']+"/labels",
                   data:{
                   },
                   success:function(data, textStatus, jqXHR){
                       var ractive = new Ractive({
                           template : '#listLab',
                           data     : {
                               labels : data
                           }
                       });
                       $('#labels').html(ractive.toHTML());
                   }
               });

    $.ajax({
        url:"https://api.github.com/repos/"+_config['owner']+"/"+_config['repo']+"/issues",
        data:{
            filter       : 'created',
            page         : page,
           // access_token : _config['access_token'],
            per_page     : _config['per_page']
        },
        beforeSend:function(){
          $('#container').html('<center><img src="loading.gif" class="loading"></center>');
        },
        success:function(data, textStatus, jqXHR){
            var link = jqXHR.getResponseHeader("Link") || "";
            var next = false;
            var prev = false;
            if(link.indexOf('rel="next"') > 0){
              next = true;
            }
            if(link.indexOf('rel="prev"') > 0){
              prev = true;
            }
            var ractive = new Ractive({
                template : '#listTpl',
                data     : {
                    posts : data,
                    next  : next,
                    prev  : prev,
                    page  : page,
                }
            });
            window._G.postList[page] = ractive.toHTML();
            $('#container').html(window._G.postList[page]);

            //将文章列表的信息存到全局变量中，避免重复请求
            for(i in data){
              var ractive = new Ractive({
                  template : '#detailTpl',
                  data     : {post: data[i]},
              });
              window._G.post[data[i].number] = {};
              window._G.post[data[i].number].body = ractive.toHTML();
              
              var title = data[i].title + " | " + _config['blog_name'];
              window._G.post[data[i].number].title = title;
            }
        }
    });
}

function highlight(){
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
}

// 动态加载多说评论框的函数
function toggleDuoshuoComments(container, id){
    var el = document.createElement('div');
    var url = window.location.href;
    el.setAttribute('data-thread-key', id);
    el.setAttribute('data-url', url);
    DUOSHUO.EmbedThread(el);
    jQuery(container).append(el);
}

// 添加回车键搜索功能
document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('seaKey');
    if (searchInput) {
        // 从localStorage加载搜索历史
        var searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        
        // 添加键盘事件监听
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                var searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    // 保存到搜索历史
                    if (!searchHistory.includes(searchTerm)) {
                        searchHistory.unshift(searchTerm);
                        // 限制历史记录最多10条
                        if (searchHistory.length > 10) {
                            searchHistory.pop();
                        }
                        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
                    }
                    window.location.href = '#search/' + encodeURIComponent(searchTerm);
                }
            }
        });
        
        // 添加清空搜索框按钮
        var searchContainer = searchInput.parentElement;
        var clearButton = document.createElement('button');
        clearButton.className = 'clear-search';
        clearButton.innerHTML = '×';
        clearButton.style.display = 'none';
        clearButton.title = '清空搜索';
        clearButton.onclick = function() {
            searchInput.value = '';
            this.style.display = 'none';
            searchInput.focus();
        };
        searchContainer.appendChild(clearButton);
        
        // 监听输入显示/隐藏清空按钮
        searchInput.addEventListener('input', function() {
            clearButton.style.display = this.value ? 'block' : 'none';
        });
    }
});

function search(key){
    // 解码URL编码的搜索关键词
    key = decodeURIComponent(key);
    
    var page = 1;
    window._G = {post: {}, postList: {}};
    $('title').html('搜索: ' + key + ' | ' + _config['blog_name']);
    
    // 设置搜索框的值为当前搜索关键词
    $('#seaKey').val(key);
    // 显示清空按钮
    $('.clear-search').show();
    
    if(_G.postList[page] != undefined){
        $('#container').html(_G.postList[page]);
        return;
    }
    
    // 构建更灵活的搜索查询
    // 对于短关键词(3个字符以下)，添加通配符以支持前缀匹配
    var searchQuery = key;
    if (key.length <= 3) {
        searchQuery = key + "*"; // 添加通配符进行前缀搜索
    }
    
    $.ajax({
        url:"https://api.github.com/search/issues",
        data:{
            // 使用更灵活的搜索查询语法
            q: searchQuery + " in:title,body repo:" + _config['owner'] + "/" + _config['repo'],
            sort: "created",
            order: "desc",
            page: page,
            per_page: _config['per_page']
        },
        beforeSend:function(){
            $('#container').html('<center><img src="loading.gif" alt="loading" class="loading"></center>');
        },
        success:function(data, textStatus, jqXHR){
            var link = jqXHR.getResponseHeader("Link") || "";
            var next = false;
            var prev = false;
            if (link.indexOf('rel="next"') > 0) {
                next = true;
            }
            if (link.indexOf('rel="prev"') > 0) {
                prev = true;
            }
            
            // 如果GitHub API搜索返回空结果且关键词较短，尝试本地匹配
            if ((!data.items || data.items.length === 0) && key.length > 0) {
                // 先获取所有文章，然后在本地进行匹配
                $.ajax({
                    url:"https://api.github.com/repos/"+_config['owner']+"/"+_config['repo']+"/issues",
                    data:{
                        filter: "created",
                        state: "open",
                        per_page: 100 // 获取较多文章用于本地搜索
                    },
                    success: function(allPosts) {
                        // 本地过滤匹配项
                        var filteredPosts = allPosts.filter(function(post) {
                            // 不区分大小写的匹配
                            var lowerKey = key.toLowerCase();
                            var titleMatch = post.title.toLowerCase().indexOf(lowerKey) !== -1;
                            var bodyMatch = post.body && post.body.toLowerCase().indexOf(lowerKey) !== -1;
                            var labelMatch = false;
                            
                            // 检查标签匹配
                            if (post.labels && post.labels.length > 0) {
                                labelMatch = post.labels.some(function(label) {
                                    return label.name.toLowerCase().indexOf(lowerKey) !== -1;
                                });
                            }
                            
                            return titleMatch || bodyMatch || labelMatch;
                        });
                        
                        if (filteredPosts.length > 0) {
                            // 显示本地过滤的匹配结果
                            var ractive = new Ractive({
                                template: '#listTpl',
                                data: {
                                    posts: filteredPosts,
                                    next: false,
                                    prev: false,
                                    page: 1
                                }
                            });
                            window._G.postList[page] = ractive.toHTML();
                            $('#container').html(window._G.postList[page]);
                            
                            // 存储文章信息
                            filteredPosts.forEach(function(post) {
                                var postRactive = new Ractive({
                                    template: '#detailTpl',
                                    data: {post: post}
                                });
                                window._G.post[post.number] = {};
                                window._G.post[post.number].body = postRactive.toHTML();
                                window._G.post[post.number].title = post.title + " | " + _config['blog_name'];
                            });
                            
                            // 添加本地搜索提示
                            $('#container').prepend('<div class="search-info">使用本地匹配找到 ' + filteredPosts.length + ' 个结果</div>');
                        } else {
                            // 没有找到任何匹配结果
                            $('#container').html('<div class="no-results"><h3>没有找到与 "' + key + '" 相关的文章</h3><p>请尝试其他关键词</p><a href="#/" class="back-to-home">返回首页</a></div>');
                        }
                    },
                    error: function() {
                        $('#container').html('<div class="no-results"><h3>搜索出错</h3><p>请稍后再试</p><a href="#/" class="back-to-home">返回首页</a></div>');
                    }
                });
                return;
            }
            
            // 检查是否有搜索结果
            if (!data.items || data.items.length === 0) {
                $('#container').html('<div class="no-results"><h3>没有找到与 "' + key + '" 相关的文章</h3><p>请尝试其他关键词</p><a href="#/" class="back-to-home">返回首页</a></div>');
                return;
            }
            
            data = data.items;
            var ractive = new Ractive({
                template: '#listTpl',
                data: {
                    posts: data,
                    next: next,
                    prev: prev,
                    page: page
                }
            });
            window._G.postList[page] = ractive.toHTML();
            $('#container').html(window._G.postList[page]);

            //将文章列表的信息存到全局变量中，避免重复请求
            for (i in data) {
                var ractive = new Ractive({
                    template: '#detailTpl',
                    data: {post: data[i]}
                });
                window._G.post[data[i].number] = {};
                window._G.post[data[i].number].body = ractive.toHTML();

                var title = data[i].title + " | " + _config['blog_name'];
                window._G.post[data[i].number].title = title;
            }
        },
        error: function(xhr, status, error) {
            console.error("搜索请求失败:", error);
            $('#container').html('<div class="no-results"><h3>搜索出错</h3><p>请稍后再试</p><a href="#/" class="back-to-home">返回首页</a></div>');
        }
    });
}

function detail(id){
    if(!window._G){
      window._G = {post: {}, postList: {}};
      window._G.post[id] = {};  
    }
    
    // 更新文章阅读计数
    updateReadCount(id);
    
    if(_G.post[id].body != undefined){
      $('#container').html(_G.post[id].body);
      $('title').html(_G.post[id].title);
      //toggleDuoshuoComments('#container', id);//多说下线了。。
      highlight();
      // 生成文章目录
      generateTOC();
      // 初始化阅读进度条
      initReadingProgress();
      return;
    }
    $.ajax({
        url:"https://api.github.com/repos/"+_config['owner']+"/"+_config['repo']+"/issues/" + id,
        data:{
           //  access_token:_config['access_token']
        },
        beforeSend:function(){
          $('#container').html('<center><img src="loading.gif" alt="loading" class="loading"></center>');
        },
        success:function(data){
            var ractive = new Ractive({
                 el: "#container",
                 template: '#detailTpl',
                 data: {post: data},
            });

            $('title').html(data.title + " | " + _config['blog_name']);
            //toggleDuoshuoComments('#container', id);
            highlight();
            // 生成文章目录
            generateTOC();
            // 初始化阅读进度条
            initReadingProgress();
        }
    });  
}

// 生成文章目录
function generateTOC() {
    var $content = $('.content');
    var $toc = $('#article-toc');
    
    // 如果内容区或目录容器不存在，则返回
    if ($content.length === 0 || $toc.length === 0) {
        return;
    }
    
    // 查找所有标题
    var headings = $content.find('h1, h2, h3, h4, h5, h6');
    
    // 如果没有标题，则隐藏目录区
    if (headings.length === 0) {
        $toc.hide();
        return;
    }
    
    // 添加目录标题
    $toc.html('<div class="article-toc-title">文章目录</div><ul></ul>');
    var $tocList = $toc.find('ul');
    
    // 为每个标题添加ID和目录项
    headings.each(function(index) {
        var $heading = $(this);
        var headingText = $heading.text();
        var headingId = 'heading-' + index;
        
        // 添加ID作为锚点
        $heading.attr('id', headingId);
        
        // 根据标题级别添加缩进
        var level = parseInt($heading.prop('tagName').substr(1)) - 1;
        var indent = '';
        for (var i = 0; i < level; i++) {
            indent += '  ';
        }
        
        // 添加目录项
        $tocList.append('<li class="toc-level-' + level + '">' + indent + 
                        '<a href="#' + headingId + '" class="toc-link">' + 
                        headingText + '</a></li>');
    });
    
    // 目录项点击滚动效果
    $toc.find('a').on('click', function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top - 100
        }, 500);
    });
    
    // 监听滚动，高亮当前阅读的标题
    $(window).on('scroll', function() {
        var scrollTop = $(window).scrollTop();
        
        // 找到当前视窗中的标题
        var currentHeading = null;
        headings.each(function() {
            if ($(this).offset().top <= scrollTop + 150) {
                currentHeading = $(this);
            }
        });
        
        if (currentHeading) {
            var currentId = currentHeading.attr('id');
            
            // 移除所有高亮
            $toc.find('a').removeClass('active');
            
            // 高亮当前标题对应的目录项
            $toc.find('a[href="#' + currentId + '"]').addClass('active');
        }
    });
}

// 初始化阅读进度条
function initReadingProgress() {
    var $progressBar = $('#reading-progress');
    var $article = $('.article');
    
    if ($progressBar.length === 0 || $article.length === 0) {
        return;
    }
    
    $(window).on('scroll', function() {
        // 计算阅读进度
        var windowHeight = $(window).height();
        var documentHeight = $(document).height();
        var scrollTop = $(window).scrollTop();
        var articleHeight = $article.height();
        var articleTop = $article.offset().top;
        var articleBottom = articleTop + articleHeight;
        
        // 只在文章区域内显示进度条
        if (scrollTop < articleTop) {
            $progressBar.css('width', '0%');
            return;
        }
        
        if (scrollTop > articleBottom) {
            $progressBar.css('width', '100%');
            return;
        }
        
        // 计算文章阅读百分比
        var progress = (scrollTop - articleTop) / (articleHeight - windowHeight);
        progress = Math.max(0, Math.min(1, progress)) * 100;
        
        $progressBar.css('width', progress + '%');
    });
}

// 文章阅读统计功能
function updateReadCount(id) {
    // 从localStorage获取阅读统计数据
    var readStats = JSON.parse(localStorage.getItem('readStats') || '{}');
    
    // 更新当前文章的阅读次数
    if (!readStats[id]) {
        readStats[id] = {
            count: 0,
            timestamp: Date.now()
        };
    }
    
    readStats[id].count += 1;
    readStats[id].timestamp = Date.now();
    
    // 保存回localStorage
    localStorage.setItem('readStats', JSON.stringify(readStats));
    
    // 更新热门文章列表
    updateHotArticles();
}

// 更新热门文章列表
function updateHotArticles() {
    var readStats = JSON.parse(localStorage.getItem('readStats') || '{}');
    
    // 将对象转换为数组并按阅读次数排序
    var articles = Object.keys(readStats).map(function(id) {
        return {
            id: id,
            count: readStats[id].count,
            timestamp: readStats[id].timestamp
        };
    }).sort(function(a, b) {
        // 首先按阅读次数降序排序
        if (b.count !== a.count) {
            return b.count - a.count;
        }
        // 次数相同时按最近阅读时间排序
        return b.timestamp - a.timestamp;
    });
    
    // 只保留前5篇文章
    articles = articles.slice(0, 5);
    
    // 如果左侧边栏存在且有热门文章
    if ($('.left-sidebar').length && articles.length > 0) {
        // 检查热门文章容器是否存在，不存在则创建
        if ($('.left-sidebar .hot-articles-card').length === 0) {
            // 在标签分类下面添加热门文章容器
            $('.left-sidebar #labels').after('<div class="hot-articles-card"><h3>热门文章</h3><ul class="hot-articles-list"></ul></div>');
        }
        
        var $hotList = $('.hot-articles-card .hot-articles-list');
        $hotList.empty();
        
        // 获取文章标题并添加到列表
        articles.forEach(function(article) {
            // 如果全局变量中有缓存的文章标题
            if (window._G && window._G.post[article.id] && window._G.post[article.id].title) {
                var title = window._G.post[article.id].title.replace(" | " + _config['blog_name'], "");
                $hotList.append('<li><a href="#post/' + article.id + '">' + title + ' <span class="read-count">浏览量：' + article.count + '次</span></a></li>');
            } else {
                // 如果没有缓存，需要请求文章信息
                $.ajax({
                    url: "https://api.github.com/repos/" + _config['owner'] + "/" + _config['repo'] + "/issues/" + article.id,
                    async: true,
                    success: function(data) {
                        $hotList.append('<li><a href="#post/' + article.id + '">' + data.title + ' <span class="read-count">浏览量：' + article.count + '次</span></a></li>');
                    }
                });
            }
        });
    }
}

// 在页面加载完成后更新热门文章
$(document).ready(function() {
    updateHotArticles();
    
    // 返回顶部按钮功能
    var backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        // 监听滚动事件，控制按钮显示/隐藏
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // 点击返回顶部
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

var helpers = Ractive.defaults.data;
helpers.markdown2HTML = function(content){
    return marked(content);
}
helpers.formatTime = function(time){
    return time.substr(0,10);
}



var routes = {
    '/': index,
    'p:page': index,
    'post/:postId': detail,
    'search/:key': search
};
var router = Router(routes);
router.init('/');
