/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage format
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */

FormatApp = function() {
    return {
        init : function(FormatApp) {
			
            this.store = new Ext.data.GroupingStore({
                url: config.app_host + '/format/request/method/load',
                baseParams:{
                    component: 'grid',
                    entityid: config.app_entityid,
                    start: 0,
                    limit: config.app_elementsongrid
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('format.tab.label').toLowerCase());
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });
            
            this.comboStore = new Ext.data.Store({
                url: config.app_host + '/format/request/method/load',
                baseParams:{
                    entityid: config.app_entityid,
                    component: 'combo'
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('format.tab.label').toLowerCase());
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });
            
            this.variableStore = new Ext.data.Store({
                url: config.app_host + '/format/request/method/load',
                baseParams:{
                    component: 'varcombo'
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {
                        store.insert(0, new Ext.data.Record({
                            nick: '-allvariables-',
                            name: bundle.getMsg('format.action.insertvariable.allfield')
                        }));
                        alertNoRecords(records, bundle.getMsg('format.tab.label').toLowerCase());
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });
			
            this.filters = new Ext.ux.grid.GridFilters({
                encode: true,
                local: false,
                menuFilterText: bundle.getMsg('app.languaje.find.label'),
                filters: [{
                    type: 'string',
                    dataIndex: 'code'
                },{
                    type: 'string',
                    dataIndex: 'name'
                },{
                    type: 'string',
                    dataIndex: 'comment'
                }]
            });
            
            this.expander = new Ext.ux.grid.RowExpander({
                enableCaching : false,
                tpl : new Ext.Template('\
                    <div style="width:100%;" class="x-grid3-row x-grid3-row-alt x-grid3-row-collapsed x-grid3-row-last">\
                       <table border="0" cellspacing="5" cellpadding="5" style="width:100%;" class="x-grid3-row-table">\
                          <tbody>{content}</tbody>\
                       </table>\
                    </div>')
            });
            
            this.infoTextItem = new Ext.Toolbar.TextItem('');
            
            this.contentEditor = window['ContenteditorApp'].getPanelFor({
                ref: 'contentEditor',
                app_host: config.app_host
            });
            this.contentEditor.editor.on('afterrender', function(field) {
                if(field.getToolbar())
                    field.getToolbar().insert(25, {
                        iconCls: Ext.ux.Icon('tag_orange'),
                        tooltip: {
                            text: bundle.getMsg('format.action.insertvariable.comment')+'.', 
                            title: bundle.getMsg('format.action.insertvariable.label')
                        },
                        field: field,
                        listeners: {
                            click: function(button) {
                                showValueForm('FormatApp', {
                                    layout:'column',
                                    border: false,
                                    defaults:{
                                        border:false
                                    }, 	
                                    items:[{
                                        columnWidth:.6,
                                        layout: 'form',
                                        items: [new Ext.form.ClearableCombo({
                                            ref: '../../valiableCombo',
                                            fieldLabel: bundle.getMsg('format.action.insertvariable.promptcomment'), 
                                            anchor: '-20', 
                                            store: window['FormatApp'].variableStore,
                                            tpl: '<tpl for="."><div ext:qtip="{name}" class="x-combo-list-item">{name}</div></tpl>',
                                            valueField: 'nick', 
                                            displayField: 'name',
                                            typeAhead: true,
                                            allowBlank: false,
                                            forceSelection: true,
                                            mode: 'local',
                                            triggerAction: 'all',
                                            selectOnFocus:true,
                                            emptyText: bundle.getMsg('app.form.select'),
                                            field: field,
                                            triggerConfig: {
                                                tag:'span', 
                                                cls:'x-form-twin-triggers', 
                                                style:'padding-right:2px',
                                                cn:[{
                                                    tag: "img", 
                                                    src: Ext.BLANK_IMAGE_URL, 
                                                    cls: "x-form-trigger"
                                                }]
                                            },
                                            listeners: {
                                                focus: function(combo) {
                                                    if(!combo.readOnly && !combo.disabled)
                                                        combo.getStore().load();
                                                },
                                                change: function(combo, newValue, oldValue) {
                                                    var record = combo.getStore().getAt(combo.getStore().find('nick', newValue, 0, true, true));
                                                    try {
                                                        window['FormatApp'].valueselectorFormPanel.restrictionCombo.setDisabled(record.get('mapping').indexOf('decode[')<0);
                                                    } catch (exception) { 
                                                        window['FormatApp'].valueselectorFormPanel.restrictionCombo.setDisabled(false);
                                                    }
                                                }
                                                
                                            }
                                        })]
                                    },{
                                        columnWidth:.4,
                                        layout: 'form',
                                        items: [new Ext.form.ClearableCombo({
                                            ref: '../../restrictionCombo',
                                            fieldLabel: bundle.getMsg('format.action.insertvariable.promptpresetation'), 
                                            anchor: '-20', 
                                            disabled: true,
                                            store: new Ext.data.ArrayStore({
                                                fields: ['name', 'nick'],
                                                data : [
                                                [bundle.getMsg('format.action.insertvariable.promptpresetation.commaseparatedsingleline'), 'commaseparatedsingleline'], 
                                                [bundle.getMsg('format.action.insertvariable.promptpresetation.doteparatedsingleline'), 'doteparatedsingleline'], 
                                                [bundle.getMsg('format.action.insertvariable.promptpresetation.spaceseparatedsingleline'), 'spaceseparatedsingleline'], 
                                                [bundle.getMsg('format.action.insertvariable.promptpresetation.table'), 'table']
                                                ]
                                            }),
                                            tpl: '<tpl for="."><div ext:qtip="{name}" class="x-combo-list-item">{name}</div></tpl>',
                                            valueField: 'nick', 
                                            displayField: 'name',
                                            typeAhead: true,
                                            allowBlank: false,
                                            forceSelection: true,
                                            mode: 'local',
                                            triggerAction: 'all',
                                            selectOnFocus:true,
                                            emptyText: bundle.getMsg('app.form.select'),
                                            field: field,
                                            triggerConfig: {
                                                tag:'span', 
                                                cls:'x-form-twin-triggers', 
                                                style:'padding-right:2px',
                                                cn:[{
                                                    tag: "img", 
                                                    src: Ext.BLANK_IMAGE_URL, 
                                                    cls: "x-form-trigger"
                                                }]
                                            }
                                        })]
                                    }]
                                }, function(form){
                                    var record = form.valiableCombo.getStore().getAt(form.valiableCombo.getStore().find('name',form.valiableCombo.getRawValue(), 0, true, true));
                                    console.log(form.valiableCombo, record);
                                    
                                    var records = new Array();
                                    if(record.get('nick')=='-allvariables-'){
                                        form.valiableCombo.getStore().each(function(r){
                                            if(r.get('nick')!='-allvariables-')
                                                records.push(r);
                                        });
                                    }
                                    else
                                        records.push(record);
                                    
                                    var text = '';
                                    for (var i = 0; i < records.length; i++) {
                                        record = records[i];
                                        text += '<u>'+String.format(bundle.getMsg('format.action.insertvariable.format'), record.get('name').length, form.restrictionCombo.getValue(), record.get('name'), record.get('nick'), record.get('mapping'))+'</u>';
                                        if(records.length > 1)
                                            text += '<br/><br/>';
                                    }
                                    
                                    while(text.indexOf("'")>-1)
                                        text = text.replace("'", '"');
                                    
                                    form.valiableCombo.field.relayCmd('inserthtml', text);   
                                    form.valiableCombo.reset();
                                },  button.getEl(), 730);
                            }
                        }
                    }
                    );   
            });
			
            this.formatGridPanel = new Ext.grid.GridPanel({
                region:'center',
                layout: 'fit', 
                border: false,
                autoExpandColumn: 'formatcolname',
                store: this.store,
                loadMask: true,
                keys: [panelKeysMap],
            
                listeners: {
                    activate: function(gridpanel){
                        gridpanel.getStore().load({
                            entityid: config.app_entityid
                        });
                    },
                    rowclick : function(grid, rowIndex, eventObject) {
                        var selectionModel = grid.getSelectionModel();
                        window['FormatApp'].selectionChange(selectionModel);
                    },
                    rowdblclick : function(grid, rowIndex, eventObject) {
                        if(grid.updateBtn && !grid.updateBtn.disabled && !grid.updateBtn.hidden)
                            grid.updateBtn.fireEvent('click', grid.updateBtn);
                    },
                    filterupdate: function(){
                        var text = App.getFiltersText(window['FormatApp'].formatGridPanel);
                        if(text && text!=''){
                            Ext.fly(window['FormatApp'].infoTextItem.getEl()).update(String.format(bundle.getMsg('app.form.filteringby'), text));
                            window['FormatApp'].infoTextItem.getEl().highlight('#FFFF66', {
                                block:true
                            });
                        }
                        else
                            Ext.fly(window['FormatApp'].infoTextItem.getEl()).update('');
                    }
                },
				
                columns: [this.expander, {
                    header: bundle.getMsg('format.field.name'), 
                    width: 160, 
                    sortable: true, 
                    dataIndex: 'name'
                },{
                    id:'formatcolname', 
                    header: bundle.getMsg('format.field.comment'), 
                    width: 360, 
                    sortable: true, 
                    dataIndex: 'comment'
                }],
				
                view: new Ext.grid.GroupingView({
                    markDirty: false,
                    forceFit:true,
                    groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? bundle.getMsg("app.form.elements") : bundle.getMsg("app.form.element")]})'
                }),
				
                plugins: [this.expander, this.filters],
				
                stripeRows: true,			
                tbar: [{
                    text: bundle.getMsg('app.form.add'),
                    iconCls: Ext.ux.Icon('add'),
                    ref: '../addBtn',
                    listeners: {
                        click: function(button, eventObject, hideApply, callback) {
                            window['FormatApp'].formatGridPanel.getSelectionModel().clearSelections();
                            window['FormatApp'].formatGridPanel.updateBtn.fireEvent('click', button, eventObject, hideApply, callback);
                        }
                    }
                },{
                    ref: '../updateBtn',
                    text: bundle.getMsg('app.form.info'),
                    disabled: true,
                    iconCls: Ext.ux.Icon('information'),
                    listeners: {
                        click: function(button, eventObject, hideApply, callback) {
                            App.mask.show();
                                
                            var record = window['FormatApp'].formatGridPanel.getSelectionModel().getSelected();
                            if (record){
                                window['FormatApp'].formPanel.getForm().loadRecord(record);                                
                            }
                            else
                                window['FormatApp'].formPanel.getForm().reset();
                            window['FormatApp'].showWindow(button.getEl(), hideApply, callback);
                            App.mask.hide();
                        }
                    }
                },{
                    ref: '../removeBtn',
                    text: bundle.getMsg('app.form.delete'),
                    disabled: true,
                    iconCls: Ext.ux.Icon('delete'),
                    listeners: {
                        click: function(button, eventObject, callback) {
                            Ext.defer(function(){
                                Ext.Msg.show({
                                    title: bundle.getMsg('app.msg.warning.title'),
                                    msg: bundle.getMsg('app.msg.warning.deleteselected.text'),
                                    buttons: Ext.Msg.YESNO,
                                    fn: function(btn, text){
                                        if (btn == 'yes'){											
                                            var records = window['FormatApp'].formatGridPanel.getSelectionModel().getSelections();
											
                                            var array = new Array();                                
                                            for (var i=0; i<records.length; i++)
                                                array.push(records[i].get('id'));
												
                                            new Ext.data.Connection().request({
                                                url: config.app_host + '/format/request/method/delete',
                                                params: {
                                                    ids: Ext.encode(array)
                                                },
                                                failure: requestFailed,
                                                success: requestSuccessful,
                                                callback : function(options, success, response) {
                                                    var object = Ext.decode(response.responseText);
                                                    if(object.success){
                                                        window['FormatApp'].store.load({
                                                            params:{
                                                                start: window['FormatApp'].formatGridPanel.getBottomToolbar().cursor
                                                            }
                                                        });
                                                        if(callback){
                                                            if(callback.fn)
                                                                callback.fn(callback.params);
                                                            else
                                                                callback();
                                                        }
                                                    }
                                                    else
                                                        requestFailed(response, false);
                                                    
                                                }
                                            });
                                        }
                                    },
                                    animEl: 'elId',
                                    icon: Ext.MessageBox.QUESTION
                                });
                            }, 100, this);
                        }
                    }
                },'-',{
                    ref: '../contentBtn',
                    text: bundle.getMsg('format.field.content'),
                    disabled: true,
                    iconCls: Ext.ux.Icon('page_paintbrush'),
                    listeners: {
                        click: function() {                            
                            App.mask.show();
                            var record = window['FormatApp'].formatGridPanel.getSelectionModel().getSelected();
                            if(record){
                                window['FormatApp'].contentEditor.editor.setValue(record.get('content'));
                                window['FormatApp'].gridPanel.setTitle(String.format(bundle.getMsg('format.content.label'), record.get('name')));
                                
                                window['FormatApp'].contentEditor.editor.config.callback = new Object;
                                window['FormatApp'].contentEditor.editor.config.callback.params = record;
                                window['FormatApp'].contentEditor.editor.config.callback.fn = function(params){
                                    var record = params;
                                    
                                    var msg = '';
                                    if(!Ext.Msg.isVisible()){
                                        msg = App.mask.msg;
                                        App.mask.msg = String.format(bundle.getMsg('format.action.savingcontent.label'), record.get('name')) + '...';
                                        App.mask.show();
                                    }
                                    
                                    new Ext.data.Connection().request({
                                        url: config.app_host + '/format/request/method/savecontent',
                                        params: {
                                            id: record.get('id'),
                                            content: params[1]
                                        },
                                        method: 'POST',
                                        callback : function() {  
                                            if(msg != ''){
                                                App.mask.hide();
                                                App.mask.msg = msg;
                                            }
                                        }
                                    });
                                };
                            }
                            window['FormatApp'].gridPanel.getTool('close').show();
                            window['FormatApp'].gridPanel.getLayout().setActiveItem(1);
                            App.mask.hide();
                        }
                    }
                },'->',{
                    ref: '../expandBtn',
                    iconCls: Ext.ux.Icon('expand-all', 'myicons'),
                    tooltip: bundle.getMsg('app.form.expandall'),
                    listeners: {
                        click: function() {
                            for (var i = 0; i < window['FormatApp'].formatGridPanel.getStore().getCount(); i++)
                                window['FormatApp'].expander.expandRow(i);
                        }
                    }
                },{
                    ref: '../collapseBtn',
                    iconCls: Ext.ux.Icon('collapse-all', 'myicons'),
                    tooltip: bundle.getMsg('app.form.collapseall'),
                    listeners: {
                        click: function() {
                            for (var i = 0; i < window['FormatApp'].formatGridPanel.getStore().getCount(); i++)
                                window['FormatApp'].expander.collapseRow(i);
                        }
                    }
                }],
				
                bbar: new Ext.PagingToolbar({
                    pageSize: parseInt(config.app_elementsongrid),
                    store: this.store,
                    plugins: [new Ext.ux.ProgressBarPager(), this.filters],
                    items: [{
                        tooltip: bundle.getMsg('app.form.clearfilters'),
                        iconCls: Ext.ux.Icon('table_lightning'),
                        handler: function () {
                            window['FormatApp'].formatGridPanel.filters.clearFilters();
                            Ext.fly(window['FormatApp'].infoTextItem.getEl()).update('');
                            window['FormatApp'].formatGridPanel.getSelectionModel().clearSelections();
                        } 
                    },'-', this.infoTextItem],
                    displayInfo: true,
                    displayMsg: bundle.getMsg('app.form.bbar.displaymsg'),
                    emptyMsg: String.format(bundle.getMsg('app.form.bbar.emptymsg'), bundle.getMsg('app.form.elements').toLowerCase())
                }),
				
                sm: new Ext.grid.RowSelectionModel({
                    singleSelect:false, 
                    listeners: {
                        selectionchange: window['FormatApp'].selectionChange
                    }
                })
            });
			
            this.formatGridPanel.getView().getRowClass = function(record, index, rowParams, store) {
                if (!record.get('deleteable')) 
                    return 'row-italic';
            };
            
            this.gridPanel = new Ext.Panel({
                id: 'gridPanelFormat',
                iconCls: Ext.ux.Icon('tag_orange'),
                title: config.app_showgridtitle ? bundle.getMsg("format.grid.title") : '',
                region:'center',
                layout:'card',
                activeItem: 0, // index or id
                tools: [{
                    id:'print',
                    qtip: bundle.getMsg('app.languaje.report.printview'),
                    handler: function() {
                        switch(window['FormatApp'].gridPanel.getLayout().activeItem.id){
                            case window['FormatApp'].formatGridPanel.id:
                                window['FormatApp'].formatGridPanel.title = window['FormatApp'].gridPanel.title;
                                App.printView(window['FormatApp'].formatGridPanel);
                                break;
                            case window['FormatApp'].contentEditor.id:
                                App.printView(window['FormatApp'].contentEditor.editor, ' ', ' ');
                                break;
                            default:
                                break;
                        }
                    }
                },{
                    id: 'close',
                    hidden: true,
                    qtip: bundle.getMsg('app.languaje.close.label'),
                    handler: function() {         
                        var clearFn = function(){
                            window['FormatApp'].gridPanel.getLayout().setActiveItem(0);
                            window['FormatApp'].contentEditor.editor.reset();
                                
                            window['FormatApp'].gridPanel.setTitle(bundle.getMsg('format.grid.title'));
                            window['FormatApp'].gridPanel.getTool('close').hide();
                            
                            window['FormatApp'].store.load({
                                params:{
                                    start: window['FormatApp'].formatGridPanel.getBottomToolbar().cursor,
                                    entityid: config.app_entityid
                                }
                            });
                        };
                        
                        switch(window['FormatApp'].gridPanel.getLayout().activeItem.id){
                            case window['FormatApp'].contentEditor.id:
                                clearFn();
                                break;
                            default:
                                break;
                        }
                    }
                }],
                items: [this.formatGridPanel, this.contentEditor],
                listeners: {
                    activate: function(gridpanel){
                        window['FormatApp'].store.load({
                            params:{
                                start: window['FormatApp'].formatGridPanel.getBottomToolbar().cursor,
                                entityid: config.app_entityid
                            }
                        });
                    }
                }
            });
			
            this.formPanel = new Ext.FormPanel({
                labelWidth: 75,
                labelAlign: 'top',
                url: config.app_host + '/format/request/method/save',
                frame:true,
                bodyStyle:'padding:5px 5px 0',						        
                keys: [formKeyMaping],
                items: [{
                    xtype:'textfield',
                    name: 'name',
                    fieldLabel: bundle.getMsg('format.field.name')+'<span style="color:red;"><sup>*</sup></span>', 
                    allowBlank: false,
                    anchor:'-20'
                },{
                    xtype:'textarea',
                    name: 'comment',
                    fieldLabel: bundle.getMsg('format.field.comment'), 
                    anchor:'-20'
                }]
            });
            
        },
        
        selectionChange : function(selectionModel) {
            var result = App.selectionChange(selectionModel);
            
            selectionModel.grid.contentBtn.setDisabled(selectionModel.getCount() != 1);
        },
        
        showWindow : function(animateTarget, hideApply, callback){
            window['FormatApp'].window = App.showWindow(bundle.getMsg('format.window.title'), 470, 240, window['FormatApp'].formPanel, 
                function(button){
                    if(!button){
                        button = new Object;
                        button.id = window['FormatApp'].window.submitBtn.id;
                    }
                
                    var records = window['FormatApp'].formatGridPanel.getSelectionModel().getSelections();
							
                    window['FormatApp'].formPanel.getForm().submit({
                        waitTitle : bundle.getMsg('app.msg.wait.title'), 
                        waitMsg: bundle.getMsg('app.msg.wait.text'), 
                        clientValidation: true,
                        params: {
                            id: records[0] ? records[0].get('id'):'',
                            entityid: callback && callback.entityid ? callback.entityid : config.app_entityid
                        },
                        success: function(form, action) {
                            checkSesionExpired(form, action);
                            window['FormatApp'].store.load({
                                params:{
                                    start: window['FormatApp'].formatGridPanel.getBottomToolbar().cursor
                                }
                            });
                            
                            submitFormSuccessful('FormatApp', form, action, button, !records[0], function(){
                                
                                }, callback);
                        },
                        failure: loadFormFailed
                    });
                
                }, 
                function(){
                    window['FormatApp'].formPanel.getForm().reset();
                    window['FormatApp'].window.hide();
                }, 
                animateTarget,
                false,
                false,
                false,
                hideApply ? hideApply : false);
        },
        
        applySecurity : function(groups, permissions){
            window['FormatApp'].formatGridPanel.addBtn.setVisible(permissions.indexOf('manageformat') != -1 || permissions.indexOf('manageformatadd') != -1);
            window['FormatApp'].formatGridPanel.updateBtn.setVisible(permissions.indexOf('manageformat') != -1 || permissions.indexOf('manageformatedit') != -1);
            window['FormatApp'].formatGridPanel.removeBtn.setVisible(permissions.indexOf('manageformat') != -1 || permissions.indexOf('manageformatdelete') != -1); 
            
        }
    }
}();

