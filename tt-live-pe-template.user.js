// ==UserScript==
// @name         tt-live-pe-template
// @namespace    pe-template-inner
// @version      1.0
// @description  PE模板工具
// @author       whb
// @match        https://data.bytedance.net/dorado/*
// @match        https://dataleap-sg.tiktok-row.net/dorado/*
// @match        https://dataleap-oceanus.tiktok-row.net/dorado/*
// @match        https://aide.tiktok-row.net/*
// @grant        GM_addStyle
// @license      MIT
// @downloadURL  https://code.byted.org/live/Prompt_Engineering_Live/raw/main/tt-live-pe-template.user.js
// @updateURL    https://code.byted.org/live/Prompt_Engineering_Live/raw/main/tt-live-pe-template.meta.js
// ==/UserScript==
(function() {
    'use strict';

    // ==================== 判断当前站点 ====================
    const isAideSite = location.hostname.includes('aide.tiktok-row.net');
    const isDoradoSite = !isAideSite;

    // ==================== 配置区 ====================
    const SCENE_CONFIG = {
        hive_edit_caliber: {
            sceneName: "修改hive表口径",
            desc: `业务规则说明：
修改任务xx 中 xx字段的口径，数据源是xx，过滤条件是xx，加工逻辑为xx。
1.若未指定数据源，则保持原数据源不变；
2.若未指定数据源不变，则保持原过滤条件不变；
3.若未指定过滤条件且数据源为新增，则过滤条件仅限制取当日的日期分区。`,
            inputs: [
                { key: "taskName", label: "任务id(可不填)" },
                { key: "fieldName", label: "字段英文名" },
                { key: "dataSource", label: "数据源(可不填)" },
                { key: "filterCond", label: "过滤条件(可不填)" },
                { key: "logicDesc", label: "加工逻辑" }
            ],
            buildText: function(form) {
                let { taskName, fieldName, dataSource, filterCond, logicDesc } = form;
                taskName = taskName || "";
                fieldName = fieldName || "";
                logicDesc = logicDesc || "";

                let baseText = `修改任务${taskName}中${fieldName}字段的口径，`;
                baseText += dataSource.trim() ? `数据源是${dataSource}，` : '数据源保持原数据源不变，';
                baseText += filterCond.trim() ? `过滤条件是${filterCond}，` : (dataSource.trim() ? `过滤条件仅限制取当日的日期分区，` : '过滤条件保持原过滤条件不变，');
                baseText += `加工逻辑为${logicDesc}。`;
                return baseText;
            }
        },

//         larksheet2hive: {
//             sceneName: "larksheet2hive",
//             desc: `业务规则说明：
// 创建 larksheet2hive 同步任务，将飞书表格/多维表格数据同步到 Hive 表。
// 需要提供：larksheet链接、目标hive表名。`,
//             inputs: [
//                 { key: "larksheetUrl", label: "飞书表格链接" },
//                 { key: "hiveTable", label: "目标Hive表名" }
//             ],
//             buildText: function(form) {
//                 let { larksheetUrl, hiveTable } = form;
//                 return `建 larksheet2hive 任务，larksheet链接为：${larksheetUrl}，hive表为：${hiveTable}`;
//             }
//         },

//         copy_exist_task: {
//             sceneName: "复制已有任务",
//             desc: `复制现有任务并创建新任务。
// 规则：
// 1.不填新任务名 → 默认原任务名 + _copy
// 2.不填新插入表 → 默认与原表一致
// 3.自动补齐字段、更新依赖、比对代码确保一致`,
//             inputs: [
//                 { key: "taskId", label: "任务ID(可不填)" },
//                 { key: "newTaskName", label: "新任务名称(可不填)" },
//                 { key: "newTargetTable", label: "新任务插入表名(可不填)" },
//                 { key: "caliberId", label: "数据源参考口径ID(可不填)" }
//             ],
//             buildText: function(form) {
//                 let { taskId, newTaskName, newTargetTable, caliberId } = form;
//                 let text = "复制现有任务";

//                 if (taskId && taskId.trim()) {
//                     text += `${taskId}`;
//                 }
//                 text += "并创建一个新任务。";

//                 if (newTaskName && newTaskName.trim()) {
//                     text += `新任务名称为：${newTaskName}；`;
//                 } else {
//                     text += "新任务名称使用原任务名后追加"_copy"；";
//                 }

//                 if (newTargetTable && newTargetTable.trim()) {
//                     text += `新任务插入的表名为：${newTargetTable}。`;
//                 } else {
//                     text += "新任务插入表名使用与原任务一致的插入表名。";
//                 }

//                 if (caliberId && caliberId.trim()) {
//                     text += `数据源参考口径${caliberId}。`;
//                 } else {
//                     text += "";
//                 }

//                 text += `要求 1、更新新任务的依赖关系 2、对新任务代码与原任务代码进行比对，确保一致性和发现差异 3、不需要代码审查，不需要知识库召回，不需要调用skill，快速复制。`;

//                 return text;
//             }
//         },

//         format_code: {
//             sceneName: "修改代码格式化",
//             desc: `智能格式化Hive SQL代码，保持原有风格不变，未修改的行不进行格式化，仅规范化缩进、空格、换行。`,
//             inputs: [],
//             buildText: function() {
//                 return `请格式化当前代码，要求1. 保持原有代码风格、关键字大小写完全不变 2. 未修改的行禁止重新格式化 3. 仅规范化缩进、空格、逗号、换行格式 4. 不改变代码逻辑与执行结果。`;
//             }
//         },

//         quick_understand_task: {
//             sceneName: "快速熟悉任务逻辑",
//             desc: `帮我快速读懂当前SQL任务整体逻辑，按固定5点结构化拆解分析。`,
//             inputs: [],
//             buildText: function() {
//                 return `帮我快速梳理并读懂当前SQL任务逻辑，严格按下面5点结构化输出 1. 5句话以内概括整体业务目标 2. 按层级逐一拆解每个CTE或者子查询的作用与产出 3. 梳理清楚输入源表、中间层、最终输出表，画出完整数据流向 4. 明确标出代码里过滤条件、Join关联、聚合逻辑、窗口函数四个关键处理点 5. 结合业务和SQL写法，列出最容易踩坑的5个风险点和注意事项。`;
//             }
//         },

//         mysql2hive: {
//             sceneName: "MySQL2Hive",
//             desc: `将MySQL库表全量同步到Hive库表，无需修改逻辑。`,
//             inputs: [
//                 { key: "mysqlTable", label: "MySQL源表(库名.表名)" },
//                 { key: "hiveTable", label: "Hive目标表(库名.表名)" }
//             ],
//             buildText: function(form) {
//                 let { mysqlTable, hiveTable } = form;
//                 return `基于MySQL的${mysqlTable}同步到Hive的${hiveTable}。`;
//             }
//         },

//         optimize_param: {
//             sceneName: "参数优化",
//             desc: `使用 novel-optimize-sql 优化任务参数，不修改任务逻辑。`,
//             inputs: [],
//             buildText: function() {
//                 return `参数优化：使用 novel-optimize-sql 优化任务参数，不要修改任务逻辑。`;
//             }
//         },

//         optimize_logic: {
//             sceneName: "逻辑优化",
//             desc: `使用 novel-optimize-sql 优化任务逻辑，保证语义完全一致。`,
//             inputs: [],
//             buildText: function() {
//                 return `逻辑优化：使用 novel-optimize-sql 优化任务逻辑，需要确保修改前后，代码语义完全一致。`;
//             }
//         },

//         aeolus_to_hive: {
//             sceneName: "风神数据集逻辑落表",
//             desc: `使用 toufan-aeolus-sql-to-hiv，将风神数据集逻辑落Hive表。需要：数据集链接、目标表名、任务名。`,
//             inputs: [
//                 { key: "aeolusUrl", label: "风神数据集任务链接" },
//                 { key: "hiveTable", label: "Hive表名(库名.表名)" },
//                 { key: "taskName", label: "任务名称" }
//             ],
//             buildText: function(form) {
//                 let { aeolusUrl, hiveTable, taskName } = form;
//                 return `风神数据集逻辑落表：使用 toufan-aeolus-sql-to-hiv，将风神数据集${aeolusUrl}的逻辑，落一个hive表，表名称是${hiveTable}，任务名称是${taskName}。`;
//             }
//         },

//         full_code_format: {
//             sceneName: "整体代码格式化",
//             desc: `规范化 SQL 代码风格，逗号位置统一放在字段后面、添加备注、代码对齐、关键字大写。`,
//             inputs: [],
//             buildText: function() {
//                 return `整体代码格式化：请对当前SQL进行全量规范化格式化，要求如下：1.所有SQL关键字全部大写；2.逗号统一放在字段后面；3.代码对齐美观；4.合理添加字段和业务备注；5.不修改任何代码逻辑。`;
//             }
//         },

        hive_add_column: {
            sceneName: "hive表新增字段",
            desc: `在任务中新增字段，自动按规则处理过滤条件与数据源。`,
            inputs: [
                { key: "taskId", label: "任务id" },
                { key: "fieldName", label: "字段英文名" },
                { key: "fieldCnName", label: "字段中文名" },
                { key: "dataSource", label: "数据源" },
                { key: "filterCond", label: "过滤条件" },
                { key: "logicDesc", label: "加工逻辑" }
            ],
            buildText: function(form) {
                let { taskId, fieldName, fieldCnName, dataSource, filterCond, logicDesc } = form;
                let text = `在任务${taskId}中新增字段${fieldName}，字段含义为${fieldCnName}。数据源使用${dataSource}，加工逻辑为${logicDesc}。`;

                if (!filterCond || filterCond.trim() === '') {
                    text += `过滤条件按以下规则处理：若未指定过滤条件且数据源在原任务中已存在，则保持原过滤条件不变；若未指定过滤条件且数据源为新增，则过滤条件仅限制取当日的日期分区。`;
                } else {
                    text += `过滤条件为${filterCond}。`;
                }

                return text;
            }
        },

        create_hive_sql_task: {
            sceneName: "新增hive SQL任务",
            desc: `新建Hive SQL任务，按表信息、关联关系、字段逻辑完成任务创建`,
            inputs: [
                { key: "targetTable", label: "目标表表名" },
                { key: "tableGranularity", label: "表粒度（主键字段）" },
                { key: "mainTableInfo", label: "主表表名、主表别名、主表主键" },
                { key: "joinTableInfo", label: "关联表表名、关联表别名、关联表主键" },
                { key: "joinRelation", label: "表关联关系(可不填)" },
                { key: "joinMode", label: "join方式(可不填)" },
                { key: "filterCondition", label: "过滤条件(可不填)" },
                { key: "fieldProcessLogic", label: "字段加工逻辑" }
            ],
            buildText: function(form) {
                let { targetTable, tableGranularity, mainTableInfo, joinTableInfo, joinRelation, joinMode, filterCondition, fieldProcessLogic } = form;
                let content = `新建一个任务，表名${targetTable}，表的加工信息如下：表粒度（主键字段）：${tableGranularity}，主表表名、主表别名、主表主键：${mainTableInfo}，关联表表名、关联表别名、关联表主键：${joinTableInfo}，表关联关系：${joinRelation ? joinRelation : '若没有指定，则使用各表的主键关联'}，join方式：${joinMode ? joinMode : '若没有指定，则使用主表分别left join各关联表'}，过滤条件：${filterCondition ? filterCondition : '若没有指定，则仅限制取当日的分区'}，字段加工逻辑：${fieldProcessLogic}。`;
                return content;
            }
        },
        create_fill_back: {
            sceneName: "创建回溯任务",
            desc: `按照当前任务创建回溯任务`,
            inputs: [
                { key: "fillback_region", label: "回溯机房", type: "checkbox", options: ["va", "sg", "US-EastRed", "US-TTP"] },
                { key: "fillback_date", label: "回溯日期" },
                { key: "fillback_num", label: "回溯并发" }
            ],
            buildText: function(form) {
                let { fillback_region, fillback_date, fillback_num } = form;
                let content = `任务：你需要根据当前Global任务去定位对应的va、sg、US-EastRed、US- TTP的本地任务，然后对任务进行回溯。回溯机房：${fillback_region};回溯周期：${fillback_date};回溯并发：${fillback_num}`;
                return content;
            }
        }
    };

    // 场景分组配置
    const SCENE_GROUPS = [
        // {
        //     groupName: "DTS任务",
        //     keys: ["mysql2hive", "larksheet2hive"]
        // },
        // {
        //     groupName: "知识检索",
        //     keys: ["quick_understand_task"]
        // },
        // {
        //     groupName: "优化运维",
        //     keys: ["optimize_param", "optimize_logic", "format_code", "full_code_format", "create_fill_back"]
        // },
        {
            groupName: "数据开发",
            keys: ["hive_edit_caliber", "copy_exist_task", "aeolus_to_hive", "hive_add_column", "create_hive_sql_task"]
        },
        {
            groupName: "任务运维",
            keys: ["create_fill_back"]
        }
    ];

    // ==================== 样式（根据站点自动切换亮色/暗色主题）====================
    const themeVars = isAideSite ? {
        // Aide 亮色主题
        dialogBg: '#ffffff',
        dialogBorder: '#e5e6eb',
        headerBorder: '#e5e6eb',
        titleColor: '#1c1c1c',
        closeColor: '#999',
        closeHover: '#333',
        bodyColor: '#4e5969',
        descBg: '#f7f8fa',
        descColor: '#86909c',
        labelColor: '#4e5969',
        inputBg: '#f7f8fa',
        inputBorder: '#e5e6eb',
        inputColor: '#1c1c1c',
        selectBg: '#f7f8fa',
        selectBorder: '#e5e6eb',
        selectColor: '#1c1c1c',
        textareaBg: '#f7f8fa',
        textareaBorder: '#e5e6eb',
        textareaColor: '#1c1c1c',
        btnBorder: '#4080ff',
        btnColor: '#4080ff',
        btnGroupBorder: '#e5e6eb',
        overlayBg: 'rgba(0,0,0,0.35)',
        shadowColor: 'rgba(0,0,0,0.15)'
    } : {
        // Dorado 暗色主题
        dialogBg: '#222222',
        dialogBorder: '#333a42',
        headerBorder: '#333a42',
        titleColor: '#fff',
        closeColor: '#999',
        closeHover: '#fff',
        bodyColor: '#ccc',
        descBg: '#2b3038',
        descColor: '#aaa',
        labelColor: '#ccc',
        inputBg: '#2b3038',
        inputBorder: '#3a414b',
        inputColor: '#fff',
        selectBg: '#2b3038',
        selectBorder: '#3a414b',
        selectColor: '#fff',
        textareaBg: '#2b3038',
        textareaBorder: '#3a414b',
        textareaColor: '#fff',
        btnBorder: '#4080ff',
        btnColor: '#4080ff',
        btnGroupBorder: '#333a42',
        overlayBg: 'rgba(0,0,0,0.6)',
        shadowColor: 'rgba(0,0,0,0.5)'
    };

    GM_addStyle(`
        .pe-agent-switch-btn {
            margin-left: 10px !important;
            margin-right: 0 !important;
        }
        #pe-dialog-overlay {
            position: fixed;top:0;left:0;right:0;bottom:0;background:${themeVars.overlayBg};z-index:99999;display:none;
        }
        #pe-main-dialog {
            position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;max-height:85vh;background:${themeVars.dialogBg};border-radius:12px;z-index:100000;display:none;overflow-y:auto;box-shadow:0 8px 30px ${themeVars.shadowColor};border:1px solid ${themeVars.dialogBorder};
        }
        .pe-dialog-header {
            display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid ${themeVars.headerBorder};
        }
        .pe-dialog-title {
            color:${themeVars.titleColor};font-size:18px;font-weight:600;
        }
        .pe-close-btn {
            cursor:pointer;color:${themeVars.closeColor};font-size:20px;
        }
        .pe-close-btn:hover {
            color:${themeVars.closeHover};
        }
        .pe-dialog-body {
            padding:20px;color:${themeVars.bodyColor};
        }
        .pe-scene-desc {
            background:${themeVars.descBg};padding:12px;border-radius:6px;font-size:13px;line-height:1.6;color:${themeVars.descColor};margin:12px 0;white-space:pre-line;
        }
        .pe-form-item {
            margin:12px 0;display:flex;align-items:center;
        }
        .pe-form-item label {
            display:inline-block;width:130px;font-size:14px;color:${themeVars.labelColor};
        }
        .pe-form-item input {
            flex:1;padding:7px 10px;border:1px solid ${themeVars.inputBorder};border-radius:4px;background:${themeVars.inputBg};color:${themeVars.inputColor};outline:none;
        }
        #pe-scene-select {
            padding:5px 8px;border-radius:4px;border:1px solid ${themeVars.selectBorder};background:${themeVars.selectBg};color:${themeVars.selectColor};
        }
        .pe-result-area {
            width:100%;height:160px;margin-top:15px;padding:10px;border:1px solid ${themeVars.textareaBorder};border-radius:4px;resize:none;box-sizing:border-box;background:${themeVars.textareaBg};color:${themeVars.textareaColor};
        }
        .pe-btn {
            padding: 8px 24px;
            border: 1px solid ${themeVars.btnBorder};
            border-radius: 4px;
            background: transparent;
            color: ${themeVars.btnColor};
            cursor: pointer;
            font-size: 14px;
        }
        .pe-btn-group {
            display:flex;justify-content:flex-end;gap:12px;margin-top:20px;padding-top:15px;border-top:1px solid ${themeVars.btnGroupBorder};
        }
        #pe-generate-btn {
            margin-top:10px;
        }
        /* Aide 站点 PE 按钮样式 - 与 GPT-5.5 按钮风格一致 */
        .pe-aide-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 0 10px;
            border-radius: 8px;
            border: none;
            background: transparent;
            color: rgb(95, 95, 93);
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            height: 26px;
            transition: background 0.2s;
        }
        .pe-aide-btn:hover {
            background: rgba(0, 0, 0, 0.06);
        }
        .pe-aide-btn .pe-aide-icon {
            width: 17px;
            height: 17px;
            border-radius: 4px;
            background: #4080ff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 11px;
            font-weight: bold;
        }
    `);

    // ==================== 创建弹窗 ====================
    const peOverlay = document.createElement('div');
    peOverlay.id = 'pe-dialog-overlay';
    document.body.appendChild(peOverlay);

    const peMainDialog = document.createElement('div');
    peMainDialog.id = 'pe-main-dialog';
    peMainDialog.innerHTML = `
        <div class="pe-dialog-header">
            <span class="pe-dialog-title">PE模板工具</span>
            <span class="pe-close-btn">×</span>
        </div>
        <div class="pe-dialog-body">
            <div>
                <label>选择业务场景：</label>
                <select id="pe-scene-select">
                    <option value="">请选择场景</option>
                </select>
            </div>
            <div class="pe-scene-desc" id="pe-scene-desc"></div>
            <div id="pe-form-wrap"></div>
            <button id="pe-generate-btn" class="pe-btn">生成提示词</button>
            <textarea class="pe-result-area" id="pe-result-area" placeholder="生成文案预览（可编辑）"></textarea>
            <div class="pe-btn-group">
                <button class="pe-btn" id="pe-confirm-btn">确定</button>
                <button class="pe-btn" id="pe-cancel-btn">取消</button>
            </div>
        </div>
    `;
    document.body.appendChild(peMainDialog);

    // 渲染带分组的下拉框
    const peSceneSelect = document.getElementById('pe-scene-select');
    function renderSceneOptions() {
        peSceneSelect.innerHTML = '<option value="">请选择场景</option>';
        SCENE_GROUPS.forEach(group => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = group.groupName;
            group.keys.forEach(key => {
                if (SCENE_CONFIG[key]) {
                    const opt = document.createElement('option');
                    opt.value = key;
                    opt.innerText = SCENE_CONFIG[key].sceneName;
                    optgroup.appendChild(opt);
                }
            });
            peSceneSelect.appendChild(optgroup);
        });
    }
    renderSceneOptions();

    // 关闭弹窗
    document.querySelector('.pe-close-btn').onclick = () => peHide();
    document.getElementById('pe-cancel-btn').onclick = () => peHide();
    peOverlay.onclick = (e) => e.target === peOverlay && peHide();
    function peHide(){
        peOverlay.style.display = 'none';
        peMainDialog.style.display = 'none';
    }

    // 切换场景
    peSceneSelect.onchange = function() {
        const sceneKey = this.value;
        const descDom = document.getElementById('pe-scene-desc');
        const formWrap = document.getElementById('pe-form-wrap');
        formWrap.innerHTML = ''; descDom.innerText = '';
        if (!sceneKey) return;
        const info = SCENE_CONFIG[sceneKey];
        descDom.innerText = info.desc;
        info.inputs.forEach(item => {
            const div = document.createElement('div');
            div.className = 'pe-form-item';
            if (item.type === 'checkbox' && item.options) {
                // 多选 checkbox - 紧凑单行排列
                const checkboxes = item.options.map(opt =>
                    `<label style="margin-right:8px;cursor:pointer;display:inline-flex;align-items:center;gap:3px;font-size:13px;white-space:nowrap;"><input type="checkbox" class="pe-checkbox-item" data-key="${item.key}" value="${opt}" style="cursor:pointer;margin:0;"> ${opt}</label>`
                ).join('');
                div.innerHTML = `<label>${item.label}：</label><div style="flex:1;display:flex;flex-wrap:nowrap;align-items:center;">${checkboxes}</div>`;
            } else {
                div.innerHTML = `<label>${item.label}：</label><input type="text" class="pe-input-item" data-key="${item.key}">`;
            }
            formWrap.appendChild(div);
        });
    };

    // 生成提示词（预览）
    document.getElementById('pe-generate-btn').onclick = function() {
        const key = peSceneSelect.value;
        if (!key) { alert('请先选择场景'); return; }
        const inputs = document.querySelectorAll('.pe-input-item');
        const data = {};
        inputs.forEach(i => data[i.dataset.key] = i.value.trim());
        // 收集 checkbox 多选值
        const checkboxes = document.querySelectorAll('.pe-checkbox-item:checked');
        checkboxes.forEach(cb => {
            const k = cb.dataset.key;
            data[k] = data[k] ? data[k] + '、' + cb.value : cb.value;
        });
        const genText = SCENE_CONFIG[key].buildText(data);
        document.getElementById('pe-result-area').value = genText;
    };

    // 读取预览文字
    function getFinalPreviewText() {
        return document.getElementById('pe-result-area').value.trim();
    }

    // ==================== 编辑器文本插入（兼容 Dorado + Aide）====================
    function appendToEditor(text) {
        if (isAideSite) {
            // Aide 页面：tiptap/ProseMirror 编辑器
            const editor = document.querySelector('.chat-input-editor[contenteditable="true"]');
            if (!editor) {
                alert('未找到 Aide 会话编辑器');
                return;
            }
            editor.focus();
            setTimeout(() => {
                const sel = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false); // 移动到末尾
                sel.removeAllRanges();
                sel.addRange(range);
                document.execCommand('insertText', false, text);
                editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            }, 100);
        } else {
            // Dorado 页面：Draft.js 编辑器
            const editor = document.querySelector('.public-DraftEditor-content[contenteditable="true"]');
            if (!editor) {
                alert('未找到会话编辑器');
                return;
            }
            editor.focus();
            setTimeout(() => {
                const sel = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
                document.execCommand('insertText', false, ' ' + text);
                editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                editor.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            }, 100);
        }
    }

    // ========================= 用户统计 + 飞书上报 =========================
    const WEBHOOK_URL = "https://bytedance.larkoffice.com/base/automation/webhook/event/EUGcaVBIGwR9HDhx8npc1ZvunMh";

    // 获取当前登录用户名（接口实时获取）
    async function getUserName() {
        try {
            const res = await fetch("/common_service_api/user/info", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });
            const data = await res.json();
            return data?.data?.name || "unknown";
        } catch (err) {
            return "unknown";
        }
    }

    // 上报日志（飞书官方兼容格式，100%成功）
    async function reportLog(sceneKey, sceneName) {
        try {
            const user = await getUserName();
            const date = new Date().toISOString().split("T")[0];
            const time = new Date().toLocaleString();

            // 飞书多维表格 Webhook 正确格式！！！
            const payload = {
                "用户": user,
                "日期": date,
                "时间": time,
                "场景Key": sceneKey,
                "场景名称": sceneName
            };

            // 发送（标准 fetch，不搞花里胡哨，全部用户可用）
            fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

        } catch (e) {}
    }
    // ==================== 确定按钮绑定 ====================
    document.getElementById('pe-confirm-btn').onclick = function () {
        const txt = getFinalPreviewText();
        if (!txt) {
            alert('请先生成提示词');
            return;
        }
        let key = peSceneSelect.value;
        let name = SCENE_CONFIG[key]?.sceneName || "未知场景";
        reportLog(key, name);

        appendToEditor(txt);
        peHide();
    };

    // ==================== 创建 PE 按钮（兼容两个站点）====================
    function createPEButton() {
        if (isAideSite) {
            // Aide 站点：与 GPT-5.5 按钮风格统一（arco-btn 方形按钮）
            const btn = document.createElement('button');
            btn.className = 'pe-aide-btn';
            btn.type = 'button';
            btn.innerHTML = '<span class="pe-aide-icon">PE</span><span>PE模板</span>';
            btn.onclick = () => {
                peOverlay.style.display = 'block';
                peMainDialog.style.display = 'block';
            };
            return btn;
        } else {
            // Dorado 站点：保持原有按钮样式
            const wrap = document.createElement('div');
            wrap.className = 'ide__AgentSwitchButton-sc-u01tv4-1 fVnaGt pe-agent-switch-btn';

            const select = document.createElement('div');
            select.className = 'arco-select arco-select-single arco-select-size-mini model-selector model-name-button';
            select.setAttribute('tabindex', '0');

            const view = document.createElement('div');
            view.className = 'arco-select-view';
            view.title = 'PE模板';

            const selector = document.createElement('span');
            selector.className = 'arco-select-view-selector';

            const input = document.createElement('input');
            input.className = 'arco-select-view-input arco-select-hidden';
            input.autocomplete = 'off';
            input.tabIndex = -1;
            input.setAttribute('aria-hidden', true);

            const value = document.createElement('span');
            value.className = 'arco-select-view-value';
            value.innerText = 'PE模板';

            const suffix = document.createElement('div');
            suffix.className = 'arco-select-suffix';
            suffix.setAttribute('aria-hidden', true);

            selector.append(input, value);
            view.append(selector, suffix);
            select.append(view);
            wrap.append(select);

            select.onclick = () => {
                peOverlay.style.display = 'block';
                peMainDialog.style.display = 'block';
            };

            return wrap;
        }
    }

    // ==================== 挂载按钮（兼容两个站点）====================
    function mountPEButton() {
        // 已挂载则跳过
        if (document.querySelector('.pe-aide-btn') || document.querySelector('.pe-agent-switch-btn')) return;

        if (isAideSite) {
            // Aide 站点：挂载到底部工具栏左侧（GPT-5.5 和 Plan Mode 旁边）
            const footerLeadGroup = document.querySelector('[class*="FooterLeadGroup"]')
                || document.querySelector('[class*="InputFooter"] > div:first-child');
            if (!footerLeadGroup) return;
            footerLeadGroup.appendChild(createPEButton());
        } else {
            // Dorado 站点：保持原有挂载逻辑
            const rootFlex = document.querySelector('div[style*="display: flex"][style*="height: 24px"]');
            if (!rootFlex || rootFlex.querySelector('.pe-agent-switch-btn')) return;
            rootFlex.appendChild(createPEButton());
        }
    }

    // 监听挂载
    const observer = new MutationObserver(mountPEButton);
    observer.observe(document.body, { childList: true, subtree: true });
    mountPEButton();

})();