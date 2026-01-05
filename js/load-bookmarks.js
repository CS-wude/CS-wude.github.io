$(document).ready(function() {
    $.getJSON('/bookmarks/bookmarks.json', function(data) {
        // 查找左侧目录导航的容器
        var sidebarNavContainer = $('.sidebar-inner .post-toc-wrap .post-toc ol.nav');
        // 查找右侧书签内容的容器
        var bookmarksContainer = $('#bookmarks-container');

        // 清空右侧容器的原有内容
        bookmarksContainer.empty();
        // 清空左侧目录导航的原有内容，这样可以移除自动生成的目录项
        sidebarNavContainer.empty();

        // 循环处理新的顶级层级
        $.each(data, function(levelIndex, level) {
            // === 添加到左侧目录 (层级) ===
            var levelLiSidebar = $('<li class="nav-item nav-level-1"></li>');
            // 给层级链接添加一个类，方便后续事件绑定
            var levelLinkSidebar = $('<a class="nav-link bookmark-level-link" href="#"></a>').text(level.level);
            levelLiSidebar.append(levelLinkSidebar);

            var categoriesUlSidebar = $('<ol class="nav-child"></ol>');
            // 默认隐藏分类列表
            categoriesUlSidebar.hide(); // 添加了这一行来隐藏子列表

            // 循环处理层级下的分类
            $.each(level.categories, function(categoryIndex, category) {
                // === 添加到左侧目录 (分类) ===
                var categoryLiSidebar = $('<li class="nav-item nav-level-2"></li>'); // 修改为 nav-level-2 表示分类是下一级
                var categoryLinkSidebar = $('<a class="nav-link bookmark-category-link" href="#"></a>').text(category.category);
                categoryLiSidebar.append(categoryLinkSidebar);

                var bookmarksUlSidebar = $('<ol class="nav-child"></ol>');
                // 默认隐藏书签列表
                bookmarksUlSidebar.hide(); // 添加了这一行来隐藏子列表

                // 循环处理分类下的书签
                $.each(category.bookmarks, function(bookmarkIndex, bookmark) {
                    var bookmarkLiSidebar = $('<li class="nav-item nav-level-3"></li>');
                    var bookmarkLinkSidebar = $('<a class="nav-link"></a>')
                                                .attr('href', '#bookmark-' + levelIndex + '-' + categoryIndex + '-' + bookmarkIndex)
                                                .text(bookmark.name);
                    bookmarkLiSidebar.append(bookmarkLinkSidebar);
                    bookmarksUlSidebar.append(bookmarkLiSidebar);
                });
                categoryLiSidebar.append(bookmarksUlSidebar);
                categoriesUlSidebar.append(categoryLiSidebar); // 将分类添加到层级下的列表中
            });
            levelLiSidebar.append(categoriesUlSidebar); // 将层级下的分类列表添加到层级项
            sidebarNavContainer.append(levelLiSidebar); // 将层级项添加到侧边栏容器
        });


        // === 添加点击事件监听器 ===
        // 当点击带有 bookmark-level-link 类的链接时 (用于展开/收起层级下的分类)
        $('.bookmark-level-link').on('click', function(e) {
            e.preventDefault(); // 阻止默认的跳转行为
            // 找到下一个兄弟元素（即 .nav-child ol，这是分类的列表）并切换其显示状态
            $(this).next('ol.nav-child').slideToggle(); // 使用 slideToggle 添加展开/收起动画
        });

        // 当点击带有 bookmark-category-link 类的链接时 (用于展开/收起分类下的书签)
        $('.bookmark-category-link').on('click', function(e) {
            e.preventDefault(); // 阻止默认的跳转行为
            // 找到下一个兄弟元素（即 .nav-child ol，这是书签的列表）并切换其显示状态
            $(this).next('ol.nav-child').slideToggle(); // 使用 slideToggle 添加展开/收起动画
        });


        // === 添加到右侧内容区域 ===
        $.each(data, function(levelIndex, level) { // 重新循环一次数据来添加右侧内容
            var levelHtmlContent = '<h2>' + level.level + '</h2>'; // 使用 h2 表示层级标题
            bookmarksContainer.append(levelHtmlContent);
            $.each(level.categories, function(categoryIndex, category) {
                var categoryHtmlContent = '<h3>' + category.category + '</h3>'; // 使用 h3 表示分类标题
                bookmarksContainer.append(categoryHtmlContent);
                $.each(category.bookmarks, function(bookmarkIndex, bookmark) {
                    var bookmarkHtmlContent = $('<p></p>')
                                                .attr('id', 'bookmark-' + levelIndex + '-' + categoryIndex + '-' + bookmarkIndex)
                                                .html('<a target="_blank" rel="noopener" href="' + bookmark.url + '">' + bookmark.name + '</a>'); // 保留右侧书签的外部链接
                    bookmarksContainer.append(bookmarkHtmlContent);
                });
            });
        });
    });
}); 