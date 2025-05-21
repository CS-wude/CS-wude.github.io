Ractive.DEBUG = false;
function index(page){
    var page = parseInt(page) || 1;
    window._G = window._G || {post: {}, postList: {}};
    // 判断当前路径是否是 /tags/
    if (window.location.pathname === '/tags/' || window.location.pathname === '/tags/index.html') {
        // 如果是tags页面，获取并显示标签
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
                    el: '#container', // 渲染到 #container
                    template: '#listLab',
                    data: {
                        labels: data,
                        maxIssues: maxIssues
                    }
                });

                // Update the tags count in the sidebar
                $('.site-state-tags .site-state-item-count').text(data.length);
            }
        });
    } else {
        // 如果是首页或其他页面，获取并显示Issues列表
    $('title').html(_config['blog_name']);
        if (_G.postList[page] != undefined) {
      $('#container').html(_G.postList[page]);
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
          $('#container').html('<center><img src="/loading.gif" class="loading"></center>');
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

            // Update the total post count (for current page) - This will be replaced by total count later
            $('.collection-title .collection-header').text('Nice! ' + data.length + ' posts in total. Keep on posting.');

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
        }
    });
    }
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
                   $('#container').html('<center><img src="/loading.gif" alt="loading" class="loading"></center>');
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
      //toggleDuoshuoComments('#container', id);//多说下线了。。
      highlight();
      return;
    }
    $.ajax({
        url:"https://api.github.com/repos/"+_config['owner']+"/"+_config['repo']+"/issues/" + id,
        data:{
           //  access_token:_config['access_token']
        },
        beforeSend:function(){
          $('#container').html('<center><img src="/loading.gif" alt="loading" class="loading"></center>');
        },
        success:function(data){
            // console.log("Detail data received:", data); // 记录获取到的数据

            var ractive = new Ractive({
                 el: "#container",
                 template: '#detailTpl',
                 data: {post: data},
            });

            $('title').html(data.title + " | " + _config['blog_name']);
            //toggleDuoshuoComments('#container', id);
            
            // Ensure highlight is called after rendering is complete
            ractive.on('render', function() {
                // console.log("Ractive render complete, calling highlight().");
                highlight();
            });

            // In case render event doesn't fire or for initial render
            setTimeout(function(){
                // console.log("Calling highlight() via setTimeout.");
            highlight();
            }, 50);
        }
    });  

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

// 新增处理标签路由的函数
function tagDetail(tagName) {
    var page = 1;
    window._G = {post: {}, postList: {}};
    
    // 解码标签名
    var decodedTagName = decodeURIComponent(tagName);

    $('title').html(decodedTagName + " | " + _config['blog_name']);

    console.log("tagName before encoding:", tagName);

    $.ajax({
        url:"https://api.github.com/search/issues?q=is%3Aissue+is%3Aopen+label%3A" + tagName + " user:"+_config['owner']+" repo:"+_config['repo']+"&sort=created&order=desc",
        data:{
            filter       : 'created',
            page         : page,
            per_page     : _config['per_page']
        },
        beforeSend:function(){
            $('#container').html('<center><img src="/loading.gif" alt="loading" class="loading"></center>');
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
            // Search API返回的结果在items数组中
            data = data.items;

            console.log("GitHub API Search result (data.items):", data);
            console.log("Number of issues found:", data.length);

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
                el: '#container', // 渲染到 #container
                template: '#timelineTpl', // 使用新的时间线模板
                data: {
                    groupedIssues: finalGroupedIssues,
                    tagName: decodedTagName // 将解码后的标签名传递给模板
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
    'tags/': index, // 添加tags路由，指向index函数
    'tags/:tagName': tagDetail, // 新增标签详情路由
    'archives/': index, // archives 页面默认显示列表
    'archives/post/:postId': detail // archives 页面显示 Issue 详情
};
var router = Router(routes);
router.init('/');

// Update sidebar counts on application initialization
updateSidebarCounts();
