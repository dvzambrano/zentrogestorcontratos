/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage entitytype
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */

EntitytypeApp = function() {
    return {
        init : function(EntitytypeApp) {
			
            this.store = new Ext.data.GroupingStore({
                url: config.app_host + '/entitytype/request/method/load',
                baseParams:{
                    component: 'grid',
                    start: 0,
                    limit: config.app_elementsongrid
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('entitytype.tab.label').toLowerCase());
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });
            
            this.comboStore = new Ext.data.Store({
                url: config.app_host + '/entitytype/request/method/load',
                baseParams:{
                    component: 'combo'
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('entitytype.tab.label').toLowerCase());
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
                id: 'gridPanelEntitytype',
                region:'center',
                layout: 'fit', 
                iconCls: Ext.ux.Icon('tag_orange'),
                title: config.app_showgridtitle ? bundle.getMsg("entitytype.grid.title") : '',
                autoExpandColumn: 'entitytypecolname',
                store: this.store,
                loadMask: true,
                tools: [{
                    id:'print',
                    qtip: bundle.getMsg('app.languaje.report.printview'),
                    handler: function() {
                        App.printView(window['EntitytypeApp'].gridPanel);
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
                        var text = App.getFiltersText(window['EntitytypeApp'].gridPanel);
                        if(text && text!=''){
                            Ext.fly(window['EntitytypeApp'].infoTextItem.getEl()).update(String.format(bundle.getMsg('app.form.filteringby'), text));
                            window['EntitytypeApp'].infoTextItem.getEl().highlight('#FFFF66', {
                                block:true
                            });
                        }
                        else
                            Ext.fly(window['EntitytypeApp'].infoTextItem.getEl()).update('');
                    }
                },
				
                columns: [new Ext.grid.RowNumberer(),{
                    header: bundle.getMsg('entitytype.field.name'), 
                    width: 160, 
                    sortable: true, 
                    dataIndex: 'name'
                },{
                    id:'entitytypecolname', 
                    header: bundle.getMsg('entitytype.field.comment'), 
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
                            window['EntitytypeApp'].gridPanel.getSelectionModel().clearSelections();
                            window['EntitytypeApp'].gridPanel.updateBtn.fireEvent('click', button, eventObject, hideApply, callback);
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
                            var record = window['EntitytypeApp'].gridPanel.getSelectionModel().getSelected();
                            if (record){
                                window['EntitytypeApp'].formPanel.getForm().loadRecord(record);
                            }
                            else
                                window['EntitytypeApp'].formPanel.getForm().reset();
                            window['EntitytypeApp'].showWindow(button.getEl(), hideApply, callback);
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
                                            var records = window['EntitytypeApp'].gridPanel.getSelectionModel().getSelections();
											
                                            var array = new Array();                                
                                            for (var i=0; i<records.length; i++)
                                                array.push(records[i].get('id'));
												
                                            new Ext.data.Connection().request({
                                                url: config.app_host + '/entitytype/request/method/delete',
                                                params: {
                                                    ids: Ext.encode(array)
                                                },
                                                failure: requestFailed,
                                                success: requestSuccessful,
                                                callback : function(options, success, response) {
                                                    var object = Ext.decode(response.responseText);
                                                    if(object.success){
                                                        window['EntitytypeApp'].store.load({
                                                            params:{
                                                                start: window['EntitytypeApp'].gridPanel.getBottomToolbar().cursor
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
                            window['EntitytypeApp'].gridPanel.filters.clearFilters();
                            Ext.fly(window['EntitytypeApp'].infoTextItem.getEl()).update('');
                            window['EntitytypeApp'].gridPanel.getSelectionModel().clearSelections();
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
                url: config.app_host + '/entitytype/request/method/save',
                frame:true,
                bodyStyle:'padding:5px 5px 0',						        
                keys: [formKeyMaping],
                items: [{
                    xtype:'textfield',
                    name: 'name',
                    fieldLabel: bundle.getMsg('entitytype.field.name')+'<span style="color:red;"><sup>*</sup></span>', 
                    allowBlank: false,         
                    maxLength: 130, 
                    anchor:'-20'
                },{
                    xtype:'textarea',
                    name: 'comment',
                    fieldLabel: bundle.getMsg('entitytype.field.comment'),          
                    maxLength: 400, 
                    anchor:'-20'
                }]
            });
            
        },
        
        renderEntitytype : function(data, callback){
            data.generaldata = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+bundle.getMsg('piece.action.nodatatodisplay');
            if(data.comment && data.comment!='')
                data.generaldata = data.comment;
            if(callback){
                callback(data.generaldata);
            }
                
            return data;
        },
        
        showWindow : function(animateTarget, hideApply, callback){
            window['EntitytypeApp'].window = App.showWindow(bundle.getMsg('entitytype.window.title'), 370, 230, window['EntitytypeApp'].formPanel, 
                function(button){
                    if(!button){
                        button = new Object;
                        button.id = window['EntitytypeApp'].window.submitBtn.id;
                    }
                
                    var records = window['EntitytypeApp'].gridPanel.getSelectionModel().getSelections();
							
                    window['EntitytypeApp'].formPanel.getForm().submit({
                        waitTitle : bundle.getMsg('app.msg.wait.title'), 
                        waitMsg: bundle.getMsg('app.msg.wait.text'), 
                        clientValidation: true,
                        params: {
                            id: records[0] ? records[0].get('id'):''
                        },
                        success: function(form, action) {
                            checkSesionExpired(form, action);
                            window['EntitytypeApp'].store.load({
                                params:{
                                    start: window['EntitytypeApp'].gridPanel.getBottomToolbar().cursor
                                }
                            });
                            
                            submitFormSuccessful('EntitytypeApp', form, action, button, !records[0], function(){
                                
                                }, callback);
                        },
                        failure: loadFormFailed
                    });
                
                }, 
                function(){
                    window['EntitytypeApp'].formPanel.getForm().reset();
                    window['EntitytypeApp'].window.hide();
                }, 
                animateTarget,
                false,
                false,
                false,
                hideApply ? hideApply : false);
        },
        
        applySecurity : function(groups, permissions){
            window['EntitytypeApp'].gridPanel.addBtn.setVisible(permissions.indexOf('manageentitytype') != -1 || permissions.indexOf('manageentitytypeadd') != -1);
            window['EntitytypeApp'].gridPanel.updateBtn.setVisible(permissions.indexOf('manageentitytype') != -1 || permissions.indexOf('manageentitytypeedit') != -1);
            window['EntitytypeApp'].gridPanel.removeBtn.setVisible(permissions.indexOf('manageentitytype') != -1 || permissions.indexOf('manageentitytypedelete') != -1);            
        }
    }
}();

