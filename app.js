Ractive.DEBUG = false;

// ========================================
// GitHub API Token 认证
// ========================================
$.ajaxSetup({
    headers: {
        'Authorization': 'token ' + _config['access_token']
    }
});

// ========================================
// 路由变化时滚动到顶部
// ========================================
window.addEventListener('hashchange', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========================================
// 增强功能：骨架屏加载
// ========================================
function showSkeletonLoading(container) {
    var skeletonHTML = '';
    for (var i = 0; i < 5; i++) {
        skeletonHTML += `
            <div class="skeleton-card animate-fadeInUp" style="animation-delay: ${i * 0.1}s">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        `;
    }
    $(container).html(skeletonHTML);
}

// ========================================
// 增强功能：生成文章摘要
// ========================================
function generateExcerpt(body, maxLength) {
    maxLength = maxLength || 150;
    if (!body) return '';
    // 移除 Markdown 语法
    var text = body
        .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
        .replace(/\[.*?\]\(.*?\)/g, '')  // 链接
        .replace(/#{1,6}\s/g, '')        // 标题
        .replace(/[*_`~]/g, '')          // 强调
        .replace(/```[\s\S]*?```/g, '')  // 代码块
        .replace(/\n/g, ' ')             // 换行
        .trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// ========================================
// 增强功能：根据标签名生成颜色
// ========================================
function getLabelColor(name) {
    var colors = ['blue', 'green', 'orange', 'red', 'purple', 'teal'];
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function index(page){
    var page = parseInt(page) || 1;
    window._G = window._G || {post: {}, postList: {}};
    
    var pathname = window.location.pathname;
    
    // 判断当前路径是否是 /tags/
    if (pathname === '/tags/' || pathname === '/tags/index.html') {
        // 如果是tags页面，获取并显示标签
        showSkeletonLoading('#container');
        $.ajax({
            url: "https://api.github.com/repos/" + _config['owner'] + "/" + _config['repo'] + "/labels",
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            },
            success: function(data) {
                // 需要为每个标签获取文章数量
                var labelsWithCount = [];
                var completed = 0;
                var maxIssues = 0;
                
                if (data.length === 0) {
                    var ractive = new Ractive({
                        el: '#container',
                        template: '#listLab',
                        data: { labels: [], maxIssues: 0 }
                    });
                    return;
                }
                
                data.forEach(function(label, index) {
                    // 为每个标签查询文章数量
                    $.ajax({
                        url: "https://api.github.com/search/issues",
                        data: {
                            q: "is:issue is:open label:\"" + label.name + "\" repo:" + _config['owner'] + "/" + _config['repo']
                        },
                        success: function(searchData) {
                            label.issue_count = searchData.total_count || 0;
                            if (label.issue_count > maxIssues) {
                                maxIssues = label.issue_count;
                            }
                        },
                        error: function() {
                            label.issue_count = 0;
                        },
                        complete: function() {
                            completed++;
                            if (completed === data.length) {
                                // 所有请求完成，渲染页面
                                var ractive = new Ractive({
                                    el: '#container',
                                    template: '#listLab',
                                    data: {
                                        labels: data,
                                        maxIssues: maxIssues
                                    }
                                });

                                $('.site-state-tags .site-state-item-count').text(data.length);
                                
                                setTimeout(function() {
                                    document.querySelectorAll('.tag-cloud a').forEach(function(el, i) {
                                        el.style.opacity = '0';
                                        el.style.animation = 'fadeInUp 0.5s ease forwards';
                                        el.style.animationDelay = (i * 0.03) + 's';
                                    });
                                }, 100);
                            }
                        }
                    });
                });
            }
        });
    } else if (pathname === '/categories/' || pathname === '/categories/index.html') {
        // 如果是categories页面，获取并显示分类（使用labels作为分类）
        showSkeletonLoading('#container');
        $.ajax({
            url: "https://api.github.com/repos/" + _config['owner'] + "/" + _config['repo'] + "/labels",
            success: function(data) {
                var maxIssues = 0;
                data.forEach(function(label) {
                    if (label.open_issues_count > maxIssues) {
                        maxIssues = label.open_issues_count;
                    }
                });

                var ractive = new Ractive({
                    el: '#container',
                    template: '#listLab',
                    data: {
                        labels: data,
                        maxIssues: maxIssues
                    }
                });

                // Update the categories count in the sidebar
                $('.site-state-categories .site-state-item-count').text(data.length);
                
                // 触发入场动画
                setTimeout(function() {
                    document.querySelectorAll('.category-card, .tag-cloud a').forEach(function(el, i) {
                        el.style.opacity = '0';
                        el.style.animation = 'fadeInUp 0.5s ease forwards';
                        el.style.animationDelay = (i * 0.05) + 's';
                    });
                }, 100);
            }
        });
    } else if (pathname === '/archives/' || pathname === '/archives/index.html') {
        // Archives 页面 - 按年份月份时间线归档（带分页）
        showSkeletonLoading('#container');
        
        // 从 hash 获取页码
        var hash = window.location.hash;
        var archivePage = 1;
        var pageMatch = hash.match(/p(\d+)/);
        if (pageMatch) {
            archivePage = parseInt(pageMatch[1]);
        }
        
        // 先获取总数
        $.ajax({
            url: "https://api.github.com/search/issues",
            data: {
                q: "is:issue is:open repo:" + _config['owner'] + "/" + _config['repo']
            },
            success: function(searchData) {
                var totalCount = searchData.total_count || 0;
                var perPage = parseInt(_config['per_page']) || 15;
                var totalPages = Math.ceil(totalCount / perPage);
                var hasNext = archivePage < totalPages;
                var hasPrev = archivePage > 1;
                
                // 获取当前页的文章
                $.ajax({
                    url: "https://api.github.com/repos/" + _config['owner'] + "/" + _config['repo'] + "/issues",
                    data: {
                        filter: 'created',
                        state: 'open',
                        page: archivePage,
                        per_page: perPage
                    },
                    success: function(data) {
                        var monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
                        
                        // 按年份和月份分组
                        var groupedByYear = {};
                        data.forEach(function(issue) {
                            var date = new Date(issue.created_at);
                            var year = date.getFullYear();
                            var month = date.getMonth();
                            
                            if (!groupedByYear[year]) {
                                groupedByYear[year] = { months: {}, count: 0 };
                            }
                            if (!groupedByYear[year].months[month]) {
                                groupedByYear[year].months[month] = [];
                            }
                            groupedByYear[year].months[month].push(issue);
                            groupedByYear[year].count++;
                        });

                        // 转换为数组格式
                        var sortedYears = Object.keys(groupedByYear).sort(function(a, b) { return b - a; });
                        var finalGroupedIssues = sortedYears.map(function(year) {
                            var yearData = groupedByYear[year];
                            var sortedMonths = Object.keys(yearData.months).sort(function(a, b) { return b - a; });
                            var monthsArray = sortedMonths.map(function(month) {
                                return {
                                    month: monthNames[parseInt(month)],
                                    issues: yearData.months[month]
                                };
                            });
                            return { 
                                year: year, 
                                months: monthsArray,
                                count: yearData.count
                            };
                        });

                        var ractive = new Ractive({
                            el: '#container',
                            template: '#archiveTimelineTpl',
                            data: {
                                groupedIssues: finalGroupedIssues,
                                totalPosts: totalCount,
                                page: archivePage,
                                hasNext: hasNext,
                                hasPrev: hasPrev
                            }
                        });

                        $('.site-state-posts .site-state-item-count').text(totalCount);

                        // 触发动画
                        setTimeout(function() {
                            document.querySelectorAll('.timeline-year-section, .timeline-month-section').forEach(function(el, i) {
                                el.style.opacity = '0';
                                el.style.animation = 'fadeInUp 0.5s ease forwards';
                                el.style.animationDelay = (i * 0.08) + 's';
                            });
                        }, 50);
                    }
                });
            }
        });
    } else {
        // 如果是首页或其他页面，获取并显示Issues列表
    $('title').html(_config['blog_name']);
        if (_G.postList[page] != undefined) {
      $('#container').html(_G.postList[page]);
      triggerCardAnimations();
      return;
    }
        $.ajax({
            url: "https://api.github.com/repos/" + _config['owner'] + "/" + _config['repo'] + "/issues",
            data: {
                filter: 'created',
                page: page,
                per_page: _config['per_page']
        },
            beforeSend: function() {
          showSkeletonLoading('#container');
        },
            success: function(data, textStatus, jqXHR) {
            var link = jqXHR.getResponseHeader("Link") || "";
            var next = false;
            var prev = false;
                if (link.indexOf('rel="next"') > 0) {
              next = true;
            }
                if (link.indexOf('rel="prev"') > 0) {
              prev = true;
            }
            
            // 为每篇文章添加摘要
            data.forEach(function(post) {
                post.excerpt = generateExcerpt(post.body);
                if (post.labels) {
                    post.labels.forEach(function(label) {
                        label.colorClass = getLabelColor(label.name);
                    });
                }
            });
            
            var ractive = new Ractive({
                    el: '#container', // 渲染到 #container
                    template: '#listTpl',
                    data: {
                        posts: data,
                        next: next,
                        prev: prev,
                        page: page,
                }
            });
            window._G.postList[page] = ractive.toHTML();

            // Update the total post count
            // $('.collection-title .collection-header').text('Nice! ' + data.length + ' posts in total. Keep on posting.');

            // 将文章列表的信息存到全局变量中，避免重复请求
            for (i in data) {
              var ractive = new Ractive({
                        template: '#detailTpl',
                        data: { post: data[i] },
              });
              window._G.post[data[i].number] = {};
              window._G.post[data[i].number].body = ractive.toHTML();
              
              var title = data[i].title + " | " + _config['blog_name'];
              window._G.post[data[i].number].title = title;
            }
            
            // 触发卡片入场动画
            triggerCardAnimations();
        }
    });
    }
}

// 触发卡片入场动画
function triggerCardAnimations() {
    setTimeout(function() {
        document.querySelectorAll('.article-card, .article-item').forEach(function(el, i) {
            el.style.opacity = '0';
            el.style.animation = 'fadeInUp 0.5s ease forwards';
            el.style.animationDelay = (i * 0.08) + 's';
        });
    }, 50);
}

function highlight(){
  console.log("highlight() function called.");
  $('pre code').each(function(i, block) {
    console.log("Highlighting block:", block);
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
function search(key){
    var page = 1;
    window._G = {post: {}, postList: {}};
    $('title').html(_config['blog_name']);
    if(_G.postList[page] != undefined){
        $('#container').html(_G.postList[page]);
        return;
    }
    $.ajax({
               url:"https://api.github.com/search/issues?q="+key+" user:"+_config['owner']+" repo:"+_config['repo']+"&sort=stars&order=desc",
               data:{
                   filter       : 'created',
                   page         : page,
                   // access_token : _config['access_token'],
                   per_page     : _config['per_page']
               },
               beforeSend:function(){
                   showSkeletonLoading('#container');
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
                  data = data.items;
                  
                  // 为每篇文章添加摘要
                  data.forEach(function(post) {
                      post.excerpt = generateExcerpt(post.body);
                      if (post.labels) {
                          post.labels.forEach(function(label) {
                              label.colorClass = getLabelColor(label.name);
                          });
                      }
                  });
                  
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
                   
                   // 触发卡片入场动画
                   triggerCardAnimations();
               }
           });

}
function detail(id){
    if(!window._G){
      window._G = {post: {}, postList: {}};
    }
    
    // Check if the post data exists in cache
    if(_G.post[id] && _G.post[id].body != undefined){
      $('#container').html(_G.post[id].body);
      $('title').html(_G.post[id].title);
      highlight();
      loadUtterancesComments(id);
      return;
    }
    $.ajax({
        url:"https://api.github.com/repos/"+_config['owner']+"/"+_config['repo']+"/issues/" + id,
        data:{
        },
        beforeSend:function(){
          showSkeletonLoading('#container');
        },
        success:function(data){
            var ractive = new Ractive({
                 el: "#container",
                 template: '#detailTpl',
                 data: {post: data},
            });

            $('title').html(data.title + " | " + _config['blog_name']);
            
            // Ensure highlight is called after rendering is complete
            ractive.on('render', function() {
                highlight();
            });

            setTimeout(function(){
                highlight();
                loadUtterancesComments(id);
            }, 50);
        }
    });  
}

// 加载 Utterances 评论
function loadUtterancesComments(issueNumber) {
    var commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) return;
    
    // 清空之前的评论
    commentsContainer.innerHTML = '';
    
    // 创建 Utterances script
    var script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', _config['owner'] + '/' + _config['repo']);
    script.setAttribute('issue-number', issueNumber);
    script.setAttribute('theme', 'github-light');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    
    commentsContainer.appendChild(script);
}

var helpers = Ractive.defaults.data;
helpers.markdown2HTML = function(content){
    console.log("markdown2HTML helper called, content:", content);
    var html = marked(content);
    console.log("marked() result:", html);
    return html;
}
helpers.formatTime = function(time){
    return time.substr(0,10);
}

// 新增一个helper函数用于计算tag-cloud等级
helpers.getTagCloudClass = function(issueCount, maxIssues) {
    if (maxIssues === 0) return 'tag-cloud-0'; // Avoid division by zero
    var level = Math.min(10, Math.floor((issueCount / maxIssues) * 10));
    return 'tag-cloud-' + level;
}

// 新增处理分类路由的函数
function categoryDetail(categoryName) {
    var page = 1;
    window._G = {post: {}, postList: {}};
    
    // 解码分类名
    var decodedCategoryName = decodeURIComponent(categoryName);

    $('title').html(decodedCategoryName + " | " + _config['blog_name']);

    $.ajax({
        url:"https://api.github.com/search/issues?q=is%3Aissue+is%3Aopen+label%3A" + categoryName + " user:"+_config['owner']+" repo:"+_config['repo']+"&sort=created&order=desc",
        data:{
            filter       : 'created',
            page         : page,
            per_page     : _config['per_page']
        },
        beforeSend:function(){
            showSkeletonLoading('#container');
        },
        success:function(data, textStatus, jqXHR){
            data = data.items;

            // 按年份分组Issues
            var groupedIssues = {};
            data.forEach(function(issue) {
                var year = new Date(issue.created_at).getFullYear();
                if (!groupedIssues[year]) {
                    groupedIssues[year] = [];
                }
                groupedIssues[year].push(issue);
            });

            // 将分组后的Issues转换为数组，并按年份降序排序
            var sortedYears = Object.keys(groupedIssues).sort(function(a, b) { return b - a; });
            var finalGroupedIssues = sortedYears.map(function(year) {
                return { year: year, issues: groupedIssues[year] };
            });

            var ractive = new Ractive({
                el: '#container',
                template: '#timelineTpl',
                data: {
                    groupedIssues: finalGroupedIssues,
                    categoryName: decodedCategoryName
                }
            });

            // 将文章列表的信息存到全局变量中，避免重复请求
            for (i in data) {
                var ractive = new Ractive({
                    template: '#detailTpl',
                    data: { post: data[i] },
                });
                window._G.post[data[i].number] = {};
                window._G.post[data[i].number].body = ractive.toHTML();

                var title = data[i].title + " | " + _config['blog_name'];
                window._G.post[data[i].number].title = title;
            }
            
            // 触发时间线动画
            setTimeout(function() {
                document.querySelectorAll('.timeline-item').forEach(function(el, i) {
                    el.style.opacity = '0';
                    el.style.animation = 'fadeInUp 0.5s ease forwards';
                    el.style.animationDelay = (i * 0.15) + 's';
                });
            }, 50);
        }
    });
}

// 新增处理标签路由的函数
function tagDetail(tagName, page) {
    page = parseInt(page) || 1;
    window._G = window._G || {post: {}, postList: {}};
    
    // 解码标签名
    var decodedTagName = decodeURIComponent(tagName);

    $('title').html(decodedTagName + " | " + _config['blog_name']);

    $.ajax({
        url: "https://api.github.com/search/issues",
        data: {
            q: "is:issue is:open label:\"" + decodedTagName + "\" repo:" + _config['owner'] + "/" + _config['repo'],
            sort: 'created',
            order: 'desc',
            page: page,
            per_page: _config['per_page']
        },
        beforeSend: function(){
            showSkeletonLoading('#container');
        },
        success: function(data, textStatus, jqXHR){
            var totalCount = data.total_count || 0;
            var totalPages = Math.ceil(totalCount / _config['per_page']);
            var hasNext = page < totalPages;
            var hasPrev = page > 1;
            
            data = data.items || [];

            var ractive = new Ractive({
                el: '#container',
                template: '#tagListTpl',
                data: {
                    posts: data,
                    tagName: decodedTagName,
                    totalCount: totalCount,
                    page: page,
                    hasNext: hasNext,
                    hasPrev: hasPrev
                }
            });

            // 缓存文章详情
            for (var i in data) {
                var r = new Ractive({
                    template: '#detailTpl',
                    data: { post: data[i] },
                });
                window._G.post[data[i].number] = {};
                window._G.post[data[i].number].body = r.toHTML();
                window._G.post[data[i].number].title = data[i].title + " | " + _config['blog_name'];
            }
            
            triggerCardAnimations();
        }
    });
}

// Function to fetch total counts and update sidebar
function updateSidebarCounts() {
    // Get total issue count using Search API
    $.ajax({
        url: "https://api.github.com/search/issues?q=is%3Aissue+is%3Aopen+user:" + _config['owner'] + " repo:" + _config['repo'],
        success: function(data) {
            if (data && data.total_count !== undefined) {
                $('.site-state-posts .site-state-item-count').text(data.total_count);
            }
        }
    });

    // Get total label count
    $.ajax({
        url: "https://api.github.com/repos/" + _config['owner'] + "/" + _config['repo'] + "/labels",
        success: function(data) {
            if (data && Array.isArray(data)) {
                $('.site-state-tags .site-state-item-count').text(data.length);
            }
        }
    });
}

var routes = {
    '/': index,
    'p:page': index,
    'post/:postId': detail,
    'search/:key': search,
    'tags/': index,
    'tags/:tagName': tagDetail,
    'tags/:tagName/p:page': tagDetail,
    'categories/': index,
    'categories/:categoryName': categoryDetail,
    'archives/': index,
    'archives/p:page': index,
    'archives/post/:postId': detail
};
var router = Router(routes);
router.init('/');

// Update sidebar counts on application initialization
updateSidebarCounts();
