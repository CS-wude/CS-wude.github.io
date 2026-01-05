/**
 * Wude Blog - 增强功能
 */
(function() {
    'use strict';

    // ========================================
    // 搜索功能
    // ========================================
    function initSearch() {
        var searchOverlay = document.querySelector('.search-pop-overlay');
        var searchInput = document.querySelector('.search-input');
        var searchResultContainer = document.querySelector('.search-result-container');
        var closeBtn = document.querySelector('.popup-btn-close');
        var searchTriggers = document.querySelectorAll('.popup-trigger, .menu-item-search a');
        
        console.log('Search init:', {
            overlay: !!searchOverlay,
            input: !!searchInput,
            triggers: searchTriggers.length
        });
        
        if (!searchOverlay || !searchInput) {
            console.log('Search elements not found, skipping init');
            return;
        }
        
        var searchTimeout = null;
        
        // 打开搜索
        function openSearch() {
            console.log('Opening search');
            searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(function() {
                searchInput.focus();
            }, 100);
        }
        
        // 关闭搜索
        function closeSearch() {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
            searchInput.value = '';
            showEmptyState();
        }
        
        // 显示空状态
        function showEmptyState() {
            searchResultContainer.innerHTML = '<div class="search-empty"><i class="fa fa-search"></i><p>输入关键词搜索文章</p></div>';
            searchResultContainer.classList.add('no-result');
        }
        
        // 显示加载状态
        function showLoading() {
            searchResultContainer.innerHTML = '<div class="search-loading"><i class="fa fa-spinner fa-pulse fa-2x"></i><p>搜索中...</p></div>';
            searchResultContainer.classList.add('no-result');
        }
        
        // 显示无结果
        function showNoResults(keyword) {
            searchResultContainer.innerHTML = '<div class="search-empty"><i class="fa fa-inbox"></i><p>没有找到与 "' + keyword + '" 相关的文章</p></div>';
            searchResultContainer.classList.add('no-result');
        }
        
        // 高亮关键词
        function highlightKeyword(text, keyword) {
            if (!text || !keyword) return text || '';
            var escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            var regex = new RegExp('(' + escapedKeyword + ')', 'gi');
            return text.replace(regex, '<span class="search-keyword">$1</span>');
        }
        
        // 生成摘要
        function generateExcerpt(body, keyword, maxLength) {
            maxLength = maxLength || 120;
            if (!body) return '';
            
            // 移除 Markdown 语法
            var text = body
                .replace(/!\[.*?\]\(.*?\)/g, '')
                .replace(/\[.*?\]\(.*?\)/g, '')
                .replace(/#{1,6}\s/g, '')
                .replace(/[*_`~]/g, '')
                .replace(/```[\s\S]*?```/g, '')
                .replace(/\n/g, ' ')
                .trim();
            
            // 尝试找到包含关键词的部分
            if (keyword) {
                var lowerText = text.toLowerCase();
                var lowerKeyword = keyword.toLowerCase();
                var index = lowerText.indexOf(lowerKeyword);
                if (index > 30) {
                    text = '...' + text.substring(index - 30);
                }
            }
            
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        }
        
        // 执行搜索
        function doSearch(keyword) {
            console.log('Searching for:', keyword);
            if (!keyword || keyword.trim().length < 2) {
                showEmptyState();
                return;
            }
            
            showLoading();
            
            var searchUrl = "https://api.github.com/search/issues?q=" + encodeURIComponent(keyword + " repo:" + _config['owner'] + "/" + _config['repo'] + " is:issue is:open") + "&sort=created&order=desc&per_page=20";
            console.log('Search URL:', searchUrl);
            
            $.ajax({
                url: searchUrl,
                success: function(data) {
                    console.log('Search results:', data);
                    if (!data.items || data.items.length === 0) {
                        showNoResults(keyword);
                        return;
                    }
                    
                    var html = '<div class="search-stats">找到 <strong>' + data.total_count + '</strong> 篇相关文章</div>';
                    html += '<ul class="search-result-list">';
                    
                    data.items.forEach(function(item) {
                        var excerpt = generateExcerpt(item.body, keyword);
                        var date = item.created_at.substring(0, 10);
                        
                        html += '<li class="search-result-item" data-number="' + item.number + '">';
                        html += '<a href="#/post/' + item.number + '">';
                        html += '<div class="search-result-title">' + highlightKeyword(item.title, keyword) + '</div>';
                        html += '<div class="search-result-excerpt">' + highlightKeyword(excerpt, keyword) + '</div>';
                        html += '<div class="search-result-meta">';
                        html += '<span><i class="far fa-calendar-alt"></i>' + date + '</span>';
                        html += '<span><i class="far fa-comment"></i>' + item.comments + ' 评论</span>';
                        html += '</div>';
                        html += '</a></li>';
                    });
                    
                    html += '</ul>';
                    
                    searchResultContainer.innerHTML = html;
                    searchResultContainer.classList.remove('no-result');
                    
                    // 点击结果关闭搜索
                    searchResultContainer.querySelectorAll('.search-result-item').forEach(function(item) {
                        item.addEventListener('click', function() {
                            closeSearch();
                        });
                    });
                },
                error: function(xhr, status, error) {
                    console.error('Search error:', error);
                    searchResultContainer.innerHTML = '<div class="search-empty"><i class="fa fa-exclamation-circle"></i><p>搜索出错，请稍后重试</p></div>';
                    searchResultContainer.classList.add('no-result');
                }
            });
        }
        
        // 绑定事件
        searchTriggers.forEach(function(trigger) {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openSearch();
            });
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSearch);
        }
        
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });
        
        // 输入搜索（防抖）
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            var keyword = this.value.trim();
            searchTimeout = setTimeout(function() {
                doSearch(keyword);
            }, 300);
        });
        
        // 回车搜索
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                doSearch(this.value.trim());
            }
            if (e.key === 'Escape') {
                closeSearch();
            }
        });
        
        // 快捷键 Ctrl+K 或 Cmd+K 打开搜索
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchOverlay.classList.contains('active')) {
                    closeSearch();
                } else {
                    openSearch();
                }
            }
        });
        
        // 初始化空状态
        showEmptyState();
        console.log('Search initialized successfully');
    }

    // 阅读进度条
    function initReadingProgress() {
        const bar = document.createElement('div');
        bar.className = 'reading-progress';
        document.body.prepend(bar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = Math.min(progress, 100) + '%';
        });
    }

    // 代码块复制按钮
    function initCodeCopy() {
        document.querySelectorAll('pre code').forEach(block => {
            const pre = block.parentElement;
            if (pre.querySelector('.copy-btn')) return;
            
            pre.style.position = 'relative';
            
            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.innerHTML = '<i class="fa fa-copy"></i>';
            btn.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(255,255,255,0.1);
                border: none;
                color: #94a3b8;
                padding: 6px 10px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
                opacity: 0;
            `;
            
            pre.addEventListener('mouseenter', () => btn.style.opacity = '1');
            pre.addEventListener('mouseleave', () => btn.style.opacity = '0');
            
            btn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(block.textContent);
                    btn.innerHTML = '<i class="fa fa-check"></i>';
                    btn.style.color = '#22c55e';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fa fa-copy"></i>';
                        btn.style.color = '#94a3b8';
                    }, 2000);
                } catch (e) {
                    console.error('复制失败', e);
                }
            });
            
            pre.appendChild(btn);
        });
    }

    // 图片点击放大
    function initImageLightbox() {
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG' && e.target.closest('.post-content')) {
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    cursor: zoom-out;
                    animation: fadeIn 0.25s ease;
                `;
                
                const img = document.createElement('img');
                img.src = e.target.src;
                img.style.cssText = `
                    max-width: 90%;
                    max-height: 90%;
                    border-radius: 8px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                `;
                
                overlay.appendChild(img);
                document.body.appendChild(overlay);
                document.body.style.overflow = 'hidden';
                
                overlay.addEventListener('click', () => {
                    overlay.style.animation = 'fadeOut 0.2s ease';
                    setTimeout(() => {
                        overlay.remove();
                        document.body.style.overflow = '';
                    }, 200);
                });
            }
        });
    }

    // 平滑滚动
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const id = this.getAttribute('href').slice(1);
                const target = document.getElementById(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // 卡片入场动画
    function initCardAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.article-card').forEach((card, i) => {
            card.style.opacity = '0';
            card.style.animationDelay = `${i * 0.08}s`;
            observer.observe(card);
        });
    }

    // 添加动画样式
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    // 初始化
    function init() {
        addStyles();
        initReadingProgress();
        initImageLightbox();
        initSmoothScroll();
        initSearch();
        
        // 延迟初始化
        setTimeout(() => {
            initCodeCopy();
            initCardAnimations();
        }, 500);
        
        // 监听路由变化后重新初始化
        window.addEventListener('hashchange', () => {
            setTimeout(() => {
                initCodeCopy();
                initCardAnimations();
            }, 300);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
