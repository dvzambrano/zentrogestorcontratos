/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package SGArqBase
 * @subpackage contractstatus
 * @author MSc. Donel Vázquez Zambrano
 * @version 1.0.0
 */

ContractstatusApp = function() {
    return {
        init : function(ContractstatusApp) {
			
            this.store = new Ext.data.GroupingStore({
                url: config.app_host + '/contractstatus/request/method/load',
                baseParams:{
                    component: 'grid',
                    entityid: config.app_entityid,
                    start: 0,
                    limit: config.app_elementsongrid
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    beforeload: beforeloadStore,
                    load: function(store, records) { 
                        alertNoRecords(records, bundle.getMsg('contractstatus.tab.label').toLowerCase());
                        
                        for(var i = 0; i < records.length; i++){
                            records[i].set('name', records[i].get('Calendar').name);
                            records[i].set('comment', records[i].get('Calendar').comment);
                            
                        }
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });

            this.comboStore = new Ext.data.Store({
                url: config.app_host + '/contractstatus/request/method/load',
                baseParams:{
                    entityid: config.app_entityid,
                    component: 'combo'
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    beforeload: beforeloadStore,
                    load: function(store, records) { 
                        alertNoRecords(records, bundle.getMsg('contractstatus.tab.label').toLowerCase());
                        
                        for(var i = 0; i < records.length; i++){
                            records[i].set('name', records[i].get('Calendar').name);
                            records[i].set('comment', records[i].get('Calendar').comment);
                            
                        }
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });
			
            this.contractStatusSelectedComboStore = new Ext.data.Store({
                url: config.app_host + '/contractstatus/request/method/load',
                baseParams:{
                    component: 'combo'
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records, options) {           
                    //                        alertNoRecords(records);
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
                    dataIndex: 'name'
                },{
                    type: 'string',
                    dataIndex: 'comment'
                }]
            });

            this.infoTextItem = new Ext.Toolbar.TextItem('');
			
            this.gridPanel = new Ext.grid.GridPanel({
                id: 'gridPanelContractstatus',
                region:'center',
                layout: 'fit', 
                iconCls: Ext.ux.Icon('tag_orange'),
                title: config.app_showgridtitle ? bundle.getMsg("contractstatus.grid.title") : '',
                autoExpandColumn: 'contractstatuscolname',
                store: this.store,
                loadMask: true,
                tools: [{
                    id:'print',
                    qtip: bundle.getMsg('app.languaje.report.printview'),
                    handler: function() {
                        App.printView(window['ContractstatusApp'].gridPanel);
                    }
                },{
                    id:'help',
                    qtip: bundle.getMsg('app.layout.help'),
                    handler: function(button, eventObject) {
                    //                        window.open('../uploads/tutorial/05 Gestion de Teames.html');
                    }
                }],
                keys: [panelKeysMap],
            
                listeners: {
                    activate: function(gridpanel){
                        gridpanel.getStore().load({
                            entityid: config.app_entityid
                        });
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
                        var text = App.getFiltersText(window['ContractstatusApp'].gridPanel);
                        if(text && text!=''){
                            Ext.fly(window['ContractstatusApp'].infoTextItem.getEl()).update(String.format(bundle.getMsg('app.form.filteringby'), text));
                            window['ContractstatusApp'].infoTextItem.getEl().highlight('#FFFF66', {
                                block:true
                            });
                        }
                        else
                            Ext.fly(window['ContractstatusApp'].infoTextItem.getEl()).update('');
                    }
                },
				
                columns: [{
                    header: ' ',
                    width: 15,
                    dataIndex: 'customcolor',
                    renderer: function(val) {
                        return '<div class="mail-calendar-cat-color ext-cal-picker-icon" style="background-color:#'+val+'">&nbsp;</div>';
                    }
                }, {
                    header: bundle.getMsg('app.form.name'), 
                    width: 170, 
                    sortable: true, 
                    dataIndex: 'name'
                },{
                    id:'contractstatuscolname', 
                    header: bundle.getMsg('app.form.comment'),
                    width: 300,
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
                            window['ContractstatusApp'].gridPanel.getSelectionModel().clearSelections();
                            window['ContractstatusApp'].gridPanel.updateBtn.fireEvent('click', button);
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
                            var record = window['ContractstatusApp'].gridPanel.getSelectionModel().getSelected();
                            var finalFn = function(){
                                if (record){
                                    window['ContractstatusApp'].formPanel.getForm().loadRecord(record);
                                    
                                    var nextstatues = record.get('ContractStatues');
                                    if(nextstatues)
                                        for (var i = 0; i < nextstatues.length; i++){
                                            var index = window['ContractstatusApp'].comboStore.find('id', nextstatues[i].id);
                                            if(index > -1){
                                                window['ContractstatusApp'].contractStatusSelectedComboStore.add(window['ContractstatusApp'].comboStore.getAt(index));
                                                window['ContractstatusApp'].comboStore.removeAt(index);
                                            }
                                        }
                                }
                                window['ContractstatusApp'].showWindow(button.getEl());
                                App.mask.hide();
                            };
                            
                            if(record){
                                var elements = new Array();
                                var element = new Object;
                                element.id = record.get('id');
                                elements.push(element);
                                        
                                window['ContractstatusApp'].comboStore.baseParams.distinct = Ext.encode(elements);
                            }
                            else
                                window['ContractstatusApp'].comboStore.baseParams.distinct = '';
                            
                            window['ContractstatusApp'].comboStore.setBaseParam('entityid', config.app_entityid);
                            window['ContractstatusApp'].comboStore.params = window['ContractstatusApp'].comboStore.baseParams;
                            syncLoad([window['ContractstatusApp'].comboStore], finalFn);
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
                                            var records = window['ContractstatusApp'].gridPanel.getSelectionModel().getSelections();
											
                                            var array = new Array();
                                            for (var i=0; i<records.length; i++)
                                                array.push(records[i].get('id'));
												
                                            new Ext.data.Connection().request({
                                                url: config.app_host + '/contractstatus/request/method/delete',
                                                params: {
                                                    ids: Ext.encode(array)
                                                },
                                                failure: requestFailed,
                                                success: requestSuccessful,
                                                callback : function(options, success, response) {
                                                    var object = Ext.decode(response.responseText);
                                                    if(object.success){
                                                        window['ContractstatusApp'].store.load({
                                                            params:{
                                                                start: window['ContractstatusApp'].gridPanel.getBottomToolbar().cursor
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
                            window['ContractstatusApp'].gridPanel.filters.clearFilters();
                            Ext.fly(window['ContractstatusApp'].infoTextItem.getEl()).update('');
                            window['ContractstatusApp'].gridPanel.getSelectionModel().clearSelections();
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
                var css = '';
                if (!record.get('deleteable')) 
                    css = 'row-italic';
                return css;
            };
			
            this.formPanel = new Ext.FormPanel({
                labelWidth: 75,
                labelAlign: 'top',
                url: config.app_host + '/contractstatus/request/method/save',
                frame:true,
                bodyStyle:'padding:5px 5px 0',
                keys: [formKeyMaping],
                items: [{
                    layout:'column',
                    items:[{
                        columnWidth:.7,
                        layout: 'form',
                        items: [{
                            xtype:'textfield',
                            name: 'name',
                            fieldLabel: bundle.getMsg('app.form.name')+'<span style="color:red;"><sup>*</sup></span>',
                            allowBlank: false,         
                            maxLength: 130, 
                            anchor:'-20'
                        }]
                    },{
                        columnWidth:.3,
                        layout: 'form',
                        items: [new Ext.ux.PaletteCombo({
                            colors: mastercolors,
                            fieldLabel: bundle.getMsg('app.form.color')+'<span style="color:red;"><sup>*</sup></span>',
                            name: 'customcolor',
                            allowBlank: false,
                            anchor:'-20'
                        })]
                    }]
                },{
                    xtype:'textarea',
                    name: 'comment',
                    fieldLabel: bundle.getMsg('app.form.comment'),         
                    maxLength: 400, 
                    anchor:'-20'
                },{
                    xtype: 'itemselector',
                    name: 'status',
                    fieldLabel:  bundle.getMsg('app.form.nextstatus'),
                    bodyStyle: 'background-color:#FFFFFF',
                    imagePath: './js/extjs/ux/images/',
                    anchor:'-20',
                    multiselects: [{
                        width: 145,
                        height: 150,
                        store: this.comboStore,
                        legend: bundle.getMsg('app.languaje.select.available'),
                        displayField: 'name',
                        valueField: 'id'
                    },{
                        width: 145,
                        height: 150,
                        store: this.contractStatusSelectedComboStore,
                        legend: bundle.getMsg('app.languaje.select.selected'),
                        displayField: 'name',
                        valueField: 'id'
                    }]
                },{
                    layout:'column',
                    items:[{
                        columnWidth:.5,
                        layout: 'form',
                        items: [{
                            fieldLabel:  bundle.getMsg('contract.field.completestatus'),
                            xtype:'checkbox',
                            name: 'iscomplete',
                            boxLabel: bundle.getMsg('contract.field.iscomplete')                               
                        }]
                    },{
                        columnWidth:.5,
                        layout: 'form',
                        items: [{
                            xtype:'checkbox',
                            name: 'issuspended',
                            boxLabel: bundle.getMsg('contract.field.issuspended')                               
                        }]
                    }]
                }]
            });

        },

        showWindow : function(animateTarget, hideApply, callback){
            
            window['ContractstatusApp'].window = App.showWindow(bundle.getMsg('contractstatus.window.title'), 370, 460, window['ContractstatusApp'].formPanel, 
                function(button){
                    if(!button){
                        button = new Object;
                        button.id = window['ContractstatusApp'].window.submitBtn.id;
                    }
                    var record = window['ContractstatusApp'].gridPanel.getSelectionModel().getSelected();
							
                    window['ContractstatusApp'].formPanel.getForm().submit({
                        waitTitle : bundle.getMsg('app.msg.wait.title'), 
                        waitMsg: bundle.getMsg('app.msg.wait.text'), 
                        clientValidation: true,
                        params: {
                            id: record ? record.get('id') : '',
                            entityid: config.app_entityid
                        },
                        success: function(form, action) {
                            checkSesionExpired(form, action);
                            window['ContractstatusApp'].store.load({
                                params:{
                                    start: window['ContractstatusApp'].gridPanel.getBottomToolbar().cursor
                                }
                            });
                            
                            submitFormSuccessful('ContractstatusApp', form, action, button, !record, function(){
                                
                                }, callback);
                        },
                        failure: loadFormFailed
                    });
                
                },
                function(){
                    window['ContractstatusApp'].formPanel.getForm().reset();
                    window['ContractstatusApp'].window.hide();
                },
                animateTarget,
                false,
                false,
                false,
                hideApply ? hideApply : false);
        }, 
		
        applySecurity : function(groups, permissions){
            window['ContractstatusApp'].gridPanel.addBtn.setVisible(permissions.indexOf('managecontractstatus') != -1 || permissions.indexOf('managecontractstatusadd') != -1);
            window['ContractstatusApp'].gridPanel.updateBtn.setVisible(permissions.indexOf('managecontractstatus') != -1 || permissions.indexOf('managecontractstatusedit') != -1);
            window['ContractstatusApp'].gridPanel.removeBtn.setVisible(permissions.indexOf('managecontractstatus') != -1 || permissions.indexOf('managecontractstatusdelete') != -1);
        }
    }
}();