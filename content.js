// 哔哩哔哩课程总时长统计插件
(function() {
    'use strict';

    let totalTimeDisplay = null;

    // 解析时间字符串为秒数
    function parseTimeToSeconds(timeStr) {
        if (!timeStr) return 0;

        // 清理字符串，移除多余空格
        timeStr = timeStr.trim();

        const parts = timeStr.split(':').map(part => parseInt(part.trim(), 10));

        if (parts.length === 3) {
            // 时:分:秒 格式
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            // 分:秒 格式
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 1) {
            // 只有秒
            return parts[0];
        }
        return 0;
    }

    // 将秒数格式化为时:分:秒
    function formatSecondsToTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}小时 ${minutes}分 ${seconds}秒`;
        } else if (minutes > 0) {
            return `${minutes}分 ${seconds}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    // 获取当前页面的所有视频时长
    function getAllVideoDurations() {
        const durations = [];
        let totalSeconds = 0;

        // 1. 课程页面 (cheese/play)
        // 选择器：课程页面的视频列表
        const cheeseItems = document.querySelectorAll('.program-list-item, .section-list-item, .video-list-item');

        // 2. 收藏夹/播放列表页面 (medialist/play)
        const medialistItems = document.querySelectorAll('.video-list-item, .list-item');

        // 3. 新版列表页面 (list)
        const listItems = document.querySelectorAll('.list-item, .video-card__info');

        // 4. 通用时长选择器
        const timeSelectors = [
            '.duration',              // 通用时长类
            '.time',                  // 通用时间类
            '.video-duration',        // 视频时长
            '.length',                // 长度
            '[data-duration]',        // 带data-duration属性
            '.bilibili-player-video-time-total', // 播放器总时长
            '.play-duration',         // 播放时长
            '.item-duration',         // 项目时长
            '.video-time',            // 视频时间
        ];

        // 尝试所有可能的选择器
        let foundElements = [];

        // 尝试课程页面的特定结构
        const cheeseDurationSelectors = [
            '.program-list-item .duration',
            '.program-list-item .time',
            '.section-episode-card__duration',
            '.section-episode-card .duration',
            '.episode-item .duration',
            '.video-episode-card__duration',
            '.list-item .duration',
            '.video-item .duration',
            '.video-card .duration'
        ];

        for (const selector of cheeseDurationSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                foundElements = [...foundElements, ...Array.from(elements)];
            }
        }

        // 如果没找到，尝试更通用的方法
        if (foundElements.length === 0) {
            // 查找页面上所有可能包含时长的文本
            const allElements = document.querySelectorAll('span, div, p');
            const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;

            for (const el of allElements) {
                const text = el.textContent.trim();
                if (timeRegex.test(text) && el.children.length === 0) {
                    // 检查元素是否在视频列表区域
                    const parent = el.closest('.list, .playlist, .video-list, .section-list, .program-list, [class*="list"], [class*="playlist"]');
                    if (parent) {
                        foundElements.push(el);
                    }
                }
            }
        }

        // 解析找到的时长
        for (const el of foundElements) {
            const timeText = el.textContent.trim();
            const seconds = parseTimeToSeconds(timeText);
            if (seconds > 0) {
                durations.push({
                    time: timeText,
                    seconds: seconds
                });
                totalSeconds += seconds;
            }
        }

        return {
            durations: durations,
            totalSeconds: totalSeconds,
            count: durations.length
        };
    }

    // 创建或更新显示面板
    function createOrUpdateDisplay(result) {
        // 如果已存在，先移除
        if (totalTimeDisplay) {
            totalTimeDisplay.remove();
        }

        // 创建显示面板
        const panel = document.createElement('div');
        panel.id = 'bilibili-total-time-panel';
        panel.className = 'bilibili-total-time-panel';

        const formattedTime = formatSecondsToTime(result.totalSeconds);

        panel.innerHTML = `
            <div class="btt-header">
                <span class="btt-title">⏱️ 课程总时长</span>
                <span class="btt-close">✕</span>
            </div>
            <div class="btt-content">
                <div class="btt-total-time">${formattedTime}</div>
                <div class="btt-detail">
                    共 ${result.count} 个视频
                    (${(result.totalSeconds / 3600).toFixed(2)} 小时)
                </div>
            </div>
            <div class="btt-refresh">点击刷新</div>
        `;

        // 关闭按钮事件
        panel.querySelector('.btt-close').addEventListener('click', () => {
            panel.remove();
            totalTimeDisplay = null;
        });

        // 刷新按钮事件
        panel.querySelector('.btt-refresh').addEventListener('click', () => {
            const newResult = getAllVideoDurations();
            createOrUpdateDisplay(newResult);
        });

        document.body.appendChild(panel);
        totalTimeDisplay = panel;
    }

    // 主函数
    function main() {
        console.log('[哔哩哔哩总时长统计] 插件已加载');

        // 延迟执行，等待页面加载完成
        setTimeout(() => {
            const result = getAllVideoDurations();
            console.log('[哔哩哔哩总时长统计] 统计结果:', result);

            if (result.count > 0) {
                createOrUpdateDisplay(result);
            } else {
                console.log('[哔哩哔哩总时长统计] 未找到视频时长信息');
            }
        }, 2000);
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }

    // 监听页面变化（SPA页面切换）
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(() => {
                const result = getAllVideoDurations();
                if (result.count > 0) {
                    createOrUpdateDisplay(result);
                }
            }, 2000);
        }
    }).observe(document, { subtree: true, childList: true });

})();