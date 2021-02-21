/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage activity
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */

ActivityApp = function() {
    return {
        init : function(ActivityApp) {
			
            this.store = new Ext.data.GroupingStore({
                url: config.app_host + '/activity/request/method/load',
                baseParams:{
                    component: 'grid',
                    start: 0,
                    limit: config.app_elementsongrid
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('activity.tab.label').toLowerCase());
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });
            
            this.comboStore = new Ext.data.Store({
                url: config.app_host + '/activity/request/method/load',
                baseParams:{
                    component: 'combo'
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('activity.tab.label').toLowerCase());
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
            
            this.infoTextItem = new Ext.Toolbar.TextItem('');
			
            this.gridPanel = new Ext.grid.GridPanel({
                id: 'gridPanelActivity',
                region:'center',
                layout: 'fit', 
                iconCls: Ext.ux.Icon('tag_orange'),
                title: config.app_showgridtitle ? bundle.getMsg("activity.grid.title") : '',
                autoExpandColumn: 'activitycolname',
                store: this.store,
                loadMask: true,
                tools: [{
                    id:'print',
                    qtip: bundle.getMsg('app.languaje.report.printview'),
                    handler: function() {
                        App.printView(window['ActivityApp'].gridPanel);
                    }
                }],
                keys: [panelKeysMap],
            
                listeners: {
                    activate: function(gridpanel){
                        gridpanel.getStore().load();
                    },
                    rowclick : function(grid, rowIndex, eventObject) {
                        var selectionModel = grid.getSelectionModel();
                        App.selectionChange(selectionModel);
                    },
                    rowdblclick : function(grid, rowIndex, eventObject) {
                        if(grid.updateBtn && !grid.updateBtn.disabled && !grid.updateBtn.hidden)
                            grid.updateBtn.fireEvent('click', grid.updateBtn);
                    },
                    filterupdate: function(){
                        var text = App.getFiltersText(window['ActivityApp'].gridPanel);
                        if(text && text!=''){
                            Ext.fly(window['ActivityApp'].infoTextItem.getEl()).update(String.format(bundle.getMsg('app.form.filteringby'), text));
                            window['ActivityApp'].infoTextItem.getEl().highlight('#FFFF66', {
                                block:true
                            });
                        }
                        else
                            Ext.fly(window['ActivityApp'].infoTextItem.getEl()).update('');
                    }
                },
				
                columns: [new Ext.grid.RowNumberer(),{
                    header: bundle.getMsg('activity.field.name'), 
                    width: 160, 
                    sortable: true, 
                    dataIndex: 'name'
                },{
                    id:'activitycolname', 
                    header: bundle.getMsg('activity.field.comment'), 
                    width: 360, 
                    sortable: true, 
                    dataIndex: 'comment'
                }],
				
                view: new Ext.grid.GroupingView({
                    markDirty: false,
                    forceFit:true,
                    groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? bundle.getMsg("app.form.elements") : bundle.getMsg("app.form.element")]})'
                }),
				
                plugins: [this.filters],
				
                stripeRows: true,			
                tbar: [{
                    text: bundle.getMsg('app.form.add'),
                    iconCls: Ext.ux.Icon('add'),
                    ref: '../addBtn',
                    listeners: {
                        click: function(button, eventObject, hideApply, callback) {
                            window['ActivityApp'].gridPanel.getSelectionModel().clearSelections();
                            window['ActivityApp'].gridPanel.updateBtn.fireEvent('click', button, eventObject, hideApply, callback);
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
                            var record = window['ActivityApp'].gridPanel.getSelectionModel().getSelected();
                            if (record){
                                window['ActivityApp'].formPanel.getForm().loadRecord(record);
                            }
                            else
                                window['ActivityApp'].formPanel.getForm().reset();
                            window['ActivityApp'].showWindow(button.getEl(), hideApply, callback);
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
                                            var records = window['ActivityApp'].gridPanel.getSelectionModel().getSelections();
											
                                            var array = new Array();                                
                                            for (var i=0; i<records.length; i++)
                                                array.push(records[i].get('id'));
												
                                            new Ext.data.Connection().request({
                                                url: config.app_host + '/activity/request/method/delete',
                                                params: {
                                                    ids: Ext.encode(array)
                                                },
                                                failure: requestFailed,
                                                success: requestSuccessful,
                                                callback : function(options, success, response) {
                                                    var object = Ext.decode(response.responseText);
                                                    if(object.success){
                                                        window['ActivityApp'].store.load({
                                                            params:{
                                                                start: window['ActivityApp'].gridPanel.getBottomToolbar().cursor
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
                }],
				
                bbar: new Ext.PagingToolbar({
                    pageSize: parseInt(config.app_elementsongrid),
                    store: this.store,
                    plugins: [new Ext.ux.ProgressBarPager(), this.filters],
                    items: [{
                        tooltip: bundle.getMsg('app.form.clearfilters'),
                        iconCls: Ext.ux.Icon('table_lightning'),
                        handler: function () {
                            window['ActivityApp'].gridPanel.filters.clearFilters();
                            Ext.fly(window['ActivityApp'].infoTextItem.getEl()).update('');
                            window['ActivityApp'].gridPanel.getSelectionModel().clearSelections();
                        } 
                    },'-', this.infoTextItem],
                    displayInfo: true,
                    displayMsg: bundle.getMsg('app.form.bbar.displaymsg'),
                    emptyMsg: String.format(bundle.getMsg('app.form.bbar.emptymsg'), bundle.getMsg('app.form.elements').toLowerCase())
                }),
				
                sm: new Ext.grid.RowSelectionModel({
                    singleSelect:false, 
                    listeners: {
                        selectionchange: App.selectionChange
                    }
                })
            });
			
            this.gridPanel.getView().getRowClass = function(record, index, rowParams, store) {
                if (!record.get('deleteable')) 
                    return 'row-italic';
            };
			
            this.formPanel = new Ext.FormPanel({
                labelWidth: 75,
                labelAlign: 'top',
                url: config.app_host + '/activity/request/method/save',
                frame:true,
                bodyStyle:'padding:5px 5px 0',						        
                keys: [formKeyMaping],
                items: [{
                    xtype:'textfield',
                    name: 'name',
                    fieldLabel: bundle.getMsg('activity.field.name')+'<span style="color:red;"><sup>*</sup></span>', 
                    allowBlank: false,         
                    maxLength: 130, 
                    anchor:'-20'
                },{
                    xtype:'textarea',
                    name: 'comment',
                    fieldLabel: bundle.getMsg('activity.field.comment'),          
                    maxLength: 400, 
                    anchor:'-20'
                }]
            });
            
        },
        
        getPanelFor : function(entity){
            var app = Ext.util.Format.capitalize(entity.toLowerCase())+'App';
            var id = Ext.id();
            return new Ext.grid.GridPanel({
                id: id,
                ref: 'activityPanel',
                stripeRows: true,
                autoExpandColumn: entity+'activitymaincolumn',
                title: bundle.getMsg(entity+'.tab.activity'),	
                iconCls: Ext.ux.Icon('book_open'),
                store: new Ext.data.Store({
                    url: config.app_host + '/activity/request/method/load',
                    baseParams:{
                        component: 'combo'
                    },
                    reader: new Ext.data.JsonReader()
                }),
                sm: new Ext.grid.RowSelectionModel({
                    singleSelect: true, 
                    listeners: {
                        selectionchange: function(selectionModel) {
                            selectionModel.grid.removeBtn.setDisabled(selectionModel.getCount() < 1);
                        }
                    }
                }),	
                view: new Ext.grid.GridView({
                    markDirty: false,
                    forceFit: true
                }),
                columns: [new Ext.grid.RowNumberer(),{
                    id: entity+'activitymaincolumn', 
                    header: bundle.getMsg('activity.field.label'),
                    width: 140, 
                    sortable: true, 
                    dataIndex: 'name'
                },{
                    header: bundle.getMsg('activity.field.observation'),
                    width: 80, 
                    sortable: true, 
                    dataIndex: 'value'
                }],
                tbar: [new Ext.Toolbar.TextItem(bundle.getMsg('activity.field.label')+'<span style="color:red;"><sup>*</sup></span>: '), new Ext.form.ClearableCombo({
                    ref: 'activityCombo',
                    fieldLabel: bundle.getMsg('activity.field.label')+'<span style="color:red;"><sup>*</sup></span>',
                    width: 350, 
                    store: window['ActivityApp'].comboStore,
                    emptyText: bundle.getMsg('app.form.typehere'),
                    minChars: 1, //para q busque a partir de 1 caracter...
                    displayField: 'name',
                    typeAhead: false,
                    boxMaxWidth: 3000,
                    loadingText: bundle.getMsg('app.msg.wait.searching'),
                    pageSize: config.app_elementsongrid/2,
                    tpl: new Ext.XTemplate(
                        '<tpl for="."><div class="search-item">',
                        '<h3>{name}</h3>',
                        '{comment}',
                        '</div></tpl>'
                        ),
                    itemSelector: 'div.search-item',
                    listeners: {
                        beforequery: function(queryEvent) {
                            this.setValue(queryEvent.query);
                        },
                        select: function(combo, record, index ){
                            window[app].actvityRecord  = record;
                            this.collapse();
                        },
                        blur: function(field) {		
                            if(field.getRawValue() == '')
                                window[app].actvityRecord   = false;
                            else {
                                var record = field.getStore().getAt(field.getStore().find('name',field.getRawValue(), 0, true, true));								 
                                if(record && record.get('name') == field.getRawValue())
                                    window[app].actvityRecord   = record;
                                else {
                                    window[app].actvityRecord   = false;
                                    field.markInvalid(bundle.getMsg('app.error.fieldinvalid'));
                                }
                            }
                        }
                    },
                                            triggerConfig: {
                                                tag:'span', 
                                                cls:'x-form-twin-triggers', 
                                                style:'padding-right:2px',
                                                cn:[{
                                                    tag: "img", 
                                                    src: Ext.BLANK_IMAGE_URL, 
                                                    cls: "x-form-trigger x-form-search-trigger"
                                                }]
                                            }
                }),{
                    xtype: 'displayfield', 
                    value: '&nbsp;'+bundle.getMsg('activity.field.observation')+':&nbsp;'
                },{
                    xtype:'textfield',
                    ref: 'valueField',
                    width: 130
                }, '->',{
                    tooltip: bundle.getMsg('app.form.addrow'),
                    iconCls: Ext.ux.Icon('table_row_insert'),
                    listeners: {
                        click: function() {
                            if(Ext.getCmp(id).getTopToolbar().valueField.isValid()){
                                window[app].activityRecord = Ext.getCmp(id).getTopToolbar().activityCombo.getStore().getAt(Ext.getCmp(id).getTopToolbar().activityCombo.getStore().find('name',Ext.getCmp(id).getTopToolbar().activityCombo.getRawValue(), 0, true, true));
                                window[app].activityRecord.set('value', Ext.getCmp(id).getTopToolbar().valueField.getValue());
                                
                                Ext.getCmp(id).getStore().insert(Ext.getCmp(id).getStore().getCount(), window[app].activityRecord);
                                                 
                                Ext.getCmp(id).reconfigure(Ext.getCmp(id).getStore(), Ext.getCmp(id).getColumnModel());
                                                 
                                Ext.getCmp(id).getTopToolbar().valueField.reset();
                                Ext.getCmp(id).getTopToolbar().activityCombo.reset();
                            }
                        }
                    }
                },{
                    ref: '../removeBtn',
                    tooltip: bundle.getMsg('app.form.deleterow'),
                    disabled: true,
                    iconCls: Ext.ux.Icon('table_row_delete'),
                    listeners: {
                        click: function(button, eventObject) {
                            var records = Ext.getCmp(id).getSelectionModel().getSelections();
                            Ext.getCmp(id).getStore().remove(records);
                        }
                    }
                }],
                listeners: {
                    activate: function(panel) {
                        if(permissions.indexOf('manageactivity') == -1 && permissions.indexOf('manageactivityadd') == -1 && Ext.getCmp(id).getTopToolbar().activityCombo.getTrigger(1))
                            Ext.getCmp(id).getTopToolbar().activityCombo.getTrigger(1).hide();
                    }
                }
            });
        },
        
        showWindow : function(animateTarget, hideApply, callback){
            window['ActivityApp'].window = App.showWindow(bundle.getMsg('activity.window.title'), 470, 230, window['ActivityApp'].formPanel, 
                function(button){
                    if(!button){
                        button = new Object;
                        button.id = window['ActivityApp'].window.submitBtn.id;
                    }
                
                    var records = window['ActivityApp'].gridPanel.getSelectionModel().getSelections();
							
                    window['ActivityApp'].formPanel.getForm().submit({
                        waitTitle : bundle.getMsg('app.msg.wait.title'), 
                        waitMsg: bundle.getMsg('app.msg.wait.text'), 
                        clientValidation: true,
                        params: {
                            id: records[0] ? records[0].get('id'):''
                        },
                        success: function(form, action) {
                            checkSesionExpired(form, action);
                            window['ActivityApp'].store.load({
                                params:{
                                    start: window['ActivityApp'].gridPanel.getBottomToolbar().cursor
                                }
                            });
                            
                            submitFormSuccessful('ActivityApp', form, action, button, !records[0], function(){
                                
                                }, callback);
                        },
                        failure: loadFormFailed
                    });
                
                }, 
                function(){
                    window['ActivityApp'].formPanel.getForm().reset();
                    window['ActivityApp'].window.hide();
                }, 
                animateTarget,
                false,
                false,
                false,
                hideApply ? hideApply : false);
        },
        
        applySecurity : function(groups, permissions){
            window['ActivityApp'].gridPanel.addBtn.setVisible(permissions.indexOf('manageactivity') != -1 || permissions.indexOf('manageactivityadd') != -1);
            window['ActivityApp'].gridPanel.updateBtn.setVisible(permissions.indexOf('manageactivity') != -1 || permissions.indexOf('manageactivityedit') != -1);
            window['ActivityApp'].gridPanel.removeBtn.setVisible(permissions.indexOf('manageactivity') != -1 || permissions.indexOf('manageactivitydelete') != -1);            
        }
    }
}();

