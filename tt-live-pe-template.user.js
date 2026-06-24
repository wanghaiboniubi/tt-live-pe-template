// ==UserScript==
// @name         tt-live-pe-template
// @namespace    pe-template-inner
// @version      1.5
// @description  PE模板工具
// @author       whb
// @match        https://data.bytedance.net/dorado/*
// @match        https://dataleap-sg.tiktok-row.net/dorado/*
// @match        https://dataleap-oceanus.tiktok-row.net/dorado/*
// @match        https://aide.tiktok-row.net/*
// @grant        GM_addStyle
// @license      MIT
// @downloadURL  https://github.com/wanghaiboniubi/tt-live-pe-template/raw/refs/heads/main/tt-live-pe-template.user.js
// @updateURL    https://github.com/wanghaiboniubi/tt-live-pe-template/raw/refs/heads/main/tt-live-pe-template.meta.js
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

        larksheet2hive: {
            sceneName: "larksheet2hive",
            desc: `业务规则说明：
创建 larksheet2hive 同步任务，将飞书表格/多维表格数据同步到 Hive 表。
需要提供：larksheet链接、目标hive表名。`,
            inputs: [
                { key: "larksheetUrl", label: "飞书表格链接" },
                { key: "hiveTable", label: "目标Hive表名" }
            ],
            buildText: function(form) {
                let { larksheetUrl, hiveTable } = form;
                return `建 larksheet2hive 任务，larksheet链接为：${larksheetUrl}，hive表为：${hiveTable}`;
            }
        },

        copy_exist_task: {
            sceneName: "复制已有任务",
            desc: `复制现有任务并创建新任务。
规则：
1.不填新任务名 → 默认原任务名 + _copy
2.不填新插入表 → 默认与原表一致
3.自动补齐字段、更新依赖、比对代码确保一致`,
            inputs: [
                { key: "taskId", label: "任务ID(可不填)" },
                { key: "newTaskName", label: "新任务名称(可不填)" },
                { key: "newTargetTable", label: "新任务插入表名(可不填)" },
                { key: "caliberId", label: "数据源参考口径ID(可不填)" }
            ],
            buildText: function(form) {
                let { taskId, newTaskName, newTargetTable, caliberId } = form;
                let text = "复制现有任务";

                if (taskId && taskId.trim()) {
                    text += `${taskId}`;
                }
                text += "并创建一个新任务。";

                if (newTaskName && newTaskName.trim()) {
                    text += `新任务名称为：${newTaskName}；`;
                } else {
                    text += "新任务名称使用原任务名后追加_copy";
                }

                if (newTargetTable && newTargetTable.trim()) {
                    text += `新任务插入的表名为：${newTargetTable}。`;
                } else {
                    text += "新任务插入表名使用与原任务一致的插入表名。";
                }

                if (caliberId && caliberId.trim()) {
                    text += `数据源参考口径${caliberId}。`;
                } else {
                    text += "";
                }

                text += `要求 1、更新新任务的依赖关系 2、对新任务代码与原任务代码进行比对，确保一致性和发现差异 3、不需要代码审查，不需要知识库召回，不需要调用skill，快速复制。`;

                return text;
            }
        },

        format_code: {
            sceneName: "修改代码格式化",
            desc: `智能格式化Hive SQL代码，保持原有风格不变，未修改的行不进行格式化，仅规范化缩进、空格、换行。`,
            inputs: [],
            buildText: function() {
                return `请格式化当前代码，要求1. 保持原有代码风格、关键字大小写完全不变 2. 未修改的行禁止重新格式化 3. 仅规范化缩进、空格、逗号、换行格式 4. 不改变代码逻辑与执行结果。`;
            }
        },

//         quick_understand_task: {
//             sceneName: "快速熟悉任务逻辑",
//             desc: `帮我快速读懂当前SQL任务整体逻辑，按固定5点结构化拆解分析。`,
//             inputs: [],
//             buildText: function() {
//                 return `帮我快速梳理并读懂当前SQL任务逻辑，严格按下面5点结构化输出 1. 5句话以内概括整体业务目标 2. 按层级逐一拆解每个CTE或者子查询的作用与产出 3. 梳理清楚输入源表、中间层、最终输出表，画出完整数据流向 4. 明确标出代码里过滤条件、Join关联、聚合逻辑、窗口函数四个关键处理点 5. 结合业务和SQL写法，列出最容易踩坑的5个风险点和注意事项。`;
//             }
//         },
         demand_clarification: {
            sceneName: "需求澄清",
            desc: `按照当前任务澄清需求`,
            inputs: [
                { key: "clarificationKnowledge", label: "澄清知识库", type: "checkbox", options: ["多人", "公会", "活动", "游戏"] },
                { key: "clarificationSkill", label: "澄清Skill", type: "checkbox", options: ["多人", "公会", "活动", "游戏"] },
                { key: "clarificationRequirement", label: "澄清要求" }
            ],
            buildText: function(form) {
                let { clarificationKnowledge, clarificationSkill, clarificationRequirement } = form;
                clarificationKnowledge = clarificationKnowledge || "";
                clarificationSkill = clarificationSkill || "";
                clarificationRequirement = clarificationRequirement || "";
                let content = `澄清知识库：${clarificationKnowledge}；澄清Skill：${clarificationSkill}；澄清要求：${clarificationRequirement}`;
                return content;
            }
        },
        model_design: {
            sceneName: "模型设计",
            desc: `按照当前任务设计模型`,
            inputs: [
                { key: "model_designKnowledge", label: "设计知识库", type: "checkbox", options: ["多人", "公会", "活动", "游戏"] },
                { key: "model_designSkill", label: "设计Skill", type: "checkbox", options: ["多人", "公会", "活动", "游戏"] },
                { key: "model_designRequirement", label: "设计要求" }
            ],
            buildText: function(form) {
                let { model_designKnowledge, model_designSkill, model_designRequirement } = form;
                model_designKnowledge = model_designKnowledge || "";
                model_designSkill = model_designSkill || "";
                model_designRequirement = model_designRequirement || "";
                let content = `设计知识库：${model_designKnowledge}；设计Skill：${model_designSkill}；设计要求：${model_designRequirement}`;
                return content;
            }
        },

        mysql2hive: {
            sceneName: "MySQL2Hive",
            desc: `将MySQL库表全量同步到Hive库表，无需修改逻辑。`,
            inputs: [
                { key: "mysqlTable", label: "MySQL源表(库名.表名)" },
                { key: "hiveTable", label: "Hive目标表(库名.表名)" }
            ],
            buildText: function(form) {
                let { mysqlTable, hiveTable } = form;
                return `基于MySQL的${mysqlTable}同步到Hive的${hiveTable}。`;
            }
        },


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
        //Tesoro配置
        create_tesoro_api: {
            sceneName: "新建Tesoro接口",
            desc: `调用 tesoro-indicator-dev skill 创建离线指标接口。
按业务对象、粒度、接口类型、指标口径、入参出参等信息完成接口创建。`,
            inputs: [
                { key: "itemType", label: "业务对象(可不填)", type: "select", options: ["User", "Anchor", "Room", "Faction", "Principal", "Agent", "Operator", "FactionAnchor", "AnchorGift", "AnchorLiveType", "UserAnchor", "UserRoom", "FactionAgent", "FactionOperator", "UserGift", "Video", "AnchorAbnormalAction", "Total", "PlatformGroup", "FactionPlatformGroup"] },
                { key: "granularity", label: "粒度(可不填)" },
                { key: "apiType", label: "接口类型偏好", type: "select", options: ["stats", "Retrieve"] },
                { key: "metricDesc", label: "指标口径说明" },
                { key: "inputParams", label: "入参" },
                { key: "outputParams", label: "出参" },
                { key: "wiki", label: "知识库(可不填)" },
                { key: "deployRegion", label: "接口部署机房", type: "select", options: ["SG", "EU", "US"] },
                { key: "owner", label: "Owner" },
                { key: "ttl", label: "TTL/expire" }
            ],
            buildText: function(form) {
                let { itemType, granularity, apiType, metricDesc, inputParams, outputParams, wiki, deployRegion, owner, ttl } = form;
                let content = `帮我调用tesoro-indicator-dev skill\n需求：创建接口\n`;
                content += `ItemType：${itemType}\n`;
                content += `粒度：${granularity}\n`;
                content += `离线/实时：Offline\n`;
                content += `接口类型偏好：${apiType}\n`;
                content += `指标口径说明：${metricDesc}\n`;
                content += `入参：${inputParams}\n`;
                content += `出参：${outputParams}\n`;
                content += `知识库：${wiki}\n`;
                content += `部署 Region：SG\n`;
                content += `storage：${deployRegion}\n`;
                content += `Owner：${owner}\n`;
                content += `TTL / expire：${ttl}\n`;
                content += `是否需要 Task Monitor：是`;
                return content;
            }
        },

        //DECC场景配置
        create_cross_region: {
            sceneName: "新建Cross-Region场景",
            desc: `调用 tesoro-indicator-dev skill 创建完整 GlobalETL 跨区域链路。
按 local 表、涉及源机房、传输方式、detect_uv、Decc 表等信息完成创建。`,
            inputs: [
                { key: "localTable", label: "local表名" },
                { key: "sourceRegion", label: "涉及源机房", type: "multiselect", options: ["SG", "EU", "US"] },
                { key: "transferMode", label: "传输方式", type: "select", options: ["Agg有损传输", "Default无损传输"] },
                { key: "detectUv", label: "detect_uv字段名(可不填)" },
                { key: "deccTable", label: "Decc表名" }
            ],
            buildText: function(form) {
                let { localTable, sourceRegion, transferMode, detectUv, deccTable } = form;
                let content = `帮我调用tesoro-indicator-dev skill\n`;
                content += `基于${localTable}创建完整 GlobalETL 跨区域链路，覆盖${sourceRegion}区域，使用${transferMode}，detect_uv为${detectUv}。使用Decc表为${deccTable}。`;
                return content;
            }
        },

        edit_cross_region: {
            sceneName: "修改Cross-Region场景",
            desc: `基于 local 表迭代完整 GlobalETL 跨区域链路，新增字段。`,
            inputs: [
                { key: "localTable", label: "local表名" },
                { key: "newField", label: "新增字段名(对应字段类型)" },
                { key: "deccTable", label: "decc表名" }
            ],
            buildText: function(form) {
                let { localTable, newField, deccTable } = form;
                return `基于${localTable}表迭代完整 GlobalETL 跨区域链路，新增字段${newField}，decc表为${deccTable}。`;
            }
        },
        //任务运维部分
        create_fill_back: {
            sceneName: "创建回溯任务",
            desc: `按照当前任务创建回溯任务`,
            inputs: [
                { key: "fillback_task", label: "待回溯任务名/ID(可不填)" },
                { key: "fillback_region", label: "回溯机房", type: "checkbox", options: ["va", "sg", "US-EastRed", "US-TTP"] },
                { key: "fillback_date", label: "回溯日期" },
                { key: "fillback_num", label: "回溯并发" },
                { key: "fillback_dep", label: "是否依赖上游", type: "select", options: ["是", "否"] }
            ],
            buildText: function(form) {
                let { fillback_task, fillback_region, fillback_date, fillback_num, fillback_dep } = form;
                const taskDesc = (fillback_task && fillback_task.trim())
                    ? `待回溯任务为：${fillback_task.trim()}`
                    : `待回溯任务默认为当前任务`;
                const depDesc = (fillback_dep === '否') ? '不依赖上游' : '依赖上游';
                let content = `任务：你需要根据当前Global任务去定位对应的va、sg、US-EastRed、US- TTP的本地任务，然后对任务进行回溯。${taskDesc}；回溯机房：${fillback_region};回溯周期：${fillback_date};回溯并发：${fillback_num};回溯任务${depDesc}`;
                return content;
            }
        }
    };

    // 场景分组配置
    const SCENE_GROUPS = [
        {
            groupName: "需求理解",
            keys: ["demand_clarification", "model_design"]
        },
        {
            groupName: "数据开发",
            keys: ["mysql2hive", "larksheet2hive", "hive_edit_caliber", "copy_exist_task", "hive_add_column", "create_hive_sql_task", "format_code"]
        },
        {
            groupName: "任务运维",
            keys: ["create_fill_back"]
        },
        {
            groupName: "Tesoro场景",
            keys: ["create_tesoro_api"]
        },
        {
            groupName: "DECC场景",
            keys: ["create_cross_region", "edit_cross_region"]
        },
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
        /* 自定义多选下拉框 */
        .pe-ms {
            position:relative;flex:1;
        }
        .pe-ms-control {
            display:flex;align-items:center;justify-content:space-between;gap:6px;
            min-height:34px;padding:5px 10px;border:1px solid ${themeVars.selectBorder};border-radius:4px;
            background:${themeVars.selectBg};color:${themeVars.selectColor};cursor:pointer;font-size:13px;box-sizing:border-box;
        }
        .pe-ms-control .pe-ms-placeholder {
            color:${themeVars.descColor};
        }
        .pe-ms-arrow {
            border:solid ${themeVars.selectColor};border-width:0 1.5px 1.5px 0;display:inline-block;padding:3px;
            transform:rotate(45deg);transition:transform .15s;flex:none;
        }
        .pe-ms.open .pe-ms-arrow {
            transform:rotate(-135deg);
        }
        .pe-ms-panel {
            display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:100001;
            background:${themeVars.selectBg};border:1px solid ${themeVars.selectBorder};border-radius:4px;
            box-shadow:0 4px 12px ${themeVars.shadowColor};max-height:200px;overflow-y:auto;padding:4px 0;
        }
        .pe-ms.open .pe-ms-panel {
            display:block;
        }
        .pe-ms-option {
            display:flex;align-items:center;gap:8px;padding:7px 12px;cursor:pointer;font-size:13px;color:${themeVars.selectColor};
        }
        .pe-ms-option:hover {
            background:${themeVars.descBg};
        }
        .pe-ms-option input {
            flex:none;width:auto;margin:0;padding:0;cursor:pointer;
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
            if (item.type === 'multiselect' && item.options) {
                // 自定义多选下拉框
                const optsHtml = item.options.map(opt =>
                    `<label class="pe-ms-option"><input type="checkbox" class="pe-ms-item" data-key="${item.key}" value="${opt}"> ${opt}</label>`
                ).join('');
                div.innerHTML = `<label>${item.label}：</label>` +
                    `<div class="pe-ms" data-key="${item.key}">` +
                        `<div class="pe-ms-control"><span class="pe-ms-text"><span class="pe-ms-placeholder">请选择</span></span><i class="pe-ms-arrow"></i></div>` +
                        `<div class="pe-ms-panel">${optsHtml}</div>` +
                    `</div>`;
            } else if (item.type === 'checkbox' && item.options) {
                // 多选 checkbox - 紧凑单行排列
                const checkboxes = item.options.map(opt =>
                    `<label style="margin-right:8px;cursor:pointer;display:inline-flex;align-items:center;gap:3px;font-size:13px;white-space:nowrap;"><input type="checkbox" class="pe-checkbox-item" data-key="${item.key}" value="${opt}" style="cursor:pointer;margin:0;"> ${opt}</label>`
                ).join('');
                div.innerHTML = `<label>${item.label}：</label><div style="flex:1;display:flex;flex-wrap:nowrap;align-items:center;">${checkboxes}</div>`;
            } else if (item.type === 'select' && item.options) {
                // 单选下拉框
                const opts = ['<option value="">请选择</option>'].concat(
                    item.options.map(opt => `<option value="${opt}">${opt}</option>`)
                ).join('');
                div.innerHTML = `<label>${item.label}：</label><select class="pe-select-item" data-key="${item.key}" style="flex:1;padding:7px 10px;border:1px solid ${themeVars.selectBorder};border-radius:4px;background:${themeVars.selectBg};color:${themeVars.selectColor};outline:none;">${opts}</select>`;
            } else {
                div.innerHTML = `<label>${item.label}：</label><input type="text" class="pe-input-item" data-key="${item.key}">`;
            }
            formWrap.appendChild(div);
        });
        // 绑定自定义多选下拉框交互
        formWrap.querySelectorAll('.pe-ms').forEach(ms => {
            const control = ms.querySelector('.pe-ms-control');
            const textDom = ms.querySelector('.pe-ms-text');
            control.addEventListener('click', () => ms.classList.toggle('open'));
            ms.querySelectorAll('.pe-ms-item').forEach(cb => {
                cb.addEventListener('change', () => {
                    const selected = Array.from(ms.querySelectorAll('.pe-ms-item:checked')).map(i => i.value);
                    textDom.innerHTML = selected.length
                        ? selected.join('、')
                        : '<span class="pe-ms-placeholder">请选择</span>';
                });
            });
        });
    };

    // 点击外部关闭所有多选下拉框
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.pe-ms.open').forEach(ms => {
            if (!ms.contains(e.target)) ms.classList.remove('open');
        });
    });

    // 生成提示词（预览）
    document.getElementById('pe-generate-btn').onclick = function() {
        const key = peSceneSelect.value;
        if (!key) { alert('请先选择场景'); return; }
        const inputs = document.querySelectorAll('.pe-input-item');
        const data = {};
        inputs.forEach(i => data[i.dataset.key] = i.value.trim());
        // 收集 select 单选值
        const selects = document.querySelectorAll('.pe-select-item');
        selects.forEach(s => data[s.dataset.key] = s.value.trim());
        // 收集 checkbox 多选值
        const checkboxes = document.querySelectorAll('.pe-checkbox-item:checked');
        checkboxes.forEach(cb => {
            const k = cb.dataset.key;
            data[k] = data[k] ? data[k] + '、' + cb.value : cb.value;
        });
        // 收集自定义多选下拉框值
        const msItems = document.querySelectorAll('.pe-ms-item:checked');
        msItems.forEach(cb => {
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
