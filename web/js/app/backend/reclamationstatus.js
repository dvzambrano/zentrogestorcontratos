/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package SGArqBase
 * @subpackage reclamationstatus
 * @author MSc. Donel Vázquez Zambrano
 * @version 1.0.0
 */

ReclamationstatusApp = function() {
    return {
        init : function(ReclamationstatusApp) {
			
            this.store = new Ext.data.GroupingStore({
                url: config.app_host + '/reclamationstatus/request/method/load',
                baseParams:{
                    component: 'grid',
                    start: 0,
                    entityid: config.app_entityid,
                    limit: config.app_elementsongrid
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    beforeload: beforeloadStore,
                    load: function(store, records) { 
                        alertNoRecords(records, bundle.getMsg('reclamationstatus.tab.label').toLowerCase());
                        
                        for(var i = 0; i < records.length; i++){
                            records[i].set('name', records[i].get('Calendar').name);
                            records[i].set('comment', records[i].get('Calendar').comment);
                            
                        }
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });

            this.comboStore = new Ext.data.Store({
                url: config.app_host + '/reclamationstatus/request/method/load',
                baseParams:{
                    entityid: config.app_entityid,
                    component: 'combo'
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    beforeload: beforeloadStore,
                    load: function(store, records) { 
                        alertNoRecords(records, bundle.getMsg('reclamationstatus.tab.label').toLowerCase());
                        
                        for(var i = 0; i < records.length; i++){
                            records[i].set('name', records[i].get('Calendar').name);
                            records[i].set('comment', records[i].get('Calendar').comment);
                            
                        }
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });
			
            this.reclamationStatusSelectedComboStore = new Ext.data.Store({
                url: config.app_host + '/reclamationstatus/request/method/load',
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
                id: 'gridPanelReclamationstatus',
                region:'center',
                layout: 'fit', 
                iconCls: Ext.ux.Icon('tag_orange'),
                title: config.app_showgridtitle ? bundle.getMsg("reclamationstatus.grid.title") : '',
                autoExpandColumn: 'reclamationstatuscolname',
                store: this.store,
                loadMask: true,
                tools: [{
                    id:'print',
                    qtip: bundle.getMsg('app.languaje.report.printview'),
                    handler: function() {
                        App.printView(window['ReclamationstatusApp'].gridPanel);
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
                        var text = App.getFiltersText(window['ReclamationstatusApp'].gridPanel);
                        if(text && text!=''){
                            Ext.fly(window['ReclamationstatusApp'].infoTextItem.getEl()).update(String.format(bundle.getMsg('app.form.filteringby'), text));
                            window['ReclamationstatusApp'].infoTextItem.getEl().highlight('#FFFF66', {
                                block:true
                            });
                        }
                        else
                            Ext.fly(window['ReclamationstatusApp'].infoTextItem.getEl()).update('');
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
                    id:'reclamationstatuscolname', 
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
                            window['ReclamationstatusApp'].gridPanel.getSelectionModel().clearSelections();
                            window['ReclamationstatusApp'].gridPanel.updateBtn.fireEvent('click', button);
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
                            var record = window['ReclamationstatusApp'].gridPanel.getSelectionModel().getSelected();
                            var finalFn = function(){
                                if (record){
                                    window['ReclamationstatusApp'].formPanel.getForm().loadRecord(record);
                                    
                                    var nextstatues = record.get('ReclamationStatues');
                                    if(nextstatues)
                                        for (var i = 0; i < nextstatues.length; i++){
                                            var index = window['ReclamationstatusApp'].comboStore.find('id', nextstatues[i].id);
                                            if(index > -1){
                                                window['ReclamationstatusApp'].reclamationStatusSelectedComboStore.add(window['ReclamationstatusApp'].comboStore.getAt(index));
                                                window['ReclamationstatusApp'].comboStore.removeAt(index);
                                            }
                                        }
                                }
                                window['ReclamationstatusApp'].showWindow(button.getEl());
                                App.mask.hide();
                            };
                            
                            if(record){
                                var elements = new Array();
                                var element = new Object;
                                element.id = record.get('id');
                                elements.push(element);
                                        
                                window['ReclamationstatusApp'].comboStore.baseParams.distinct = Ext.encode(elements);
                            }
                            else
                                window['ReclamationstatusApp'].comboStore.baseParams.distinct = '';
                            
                            window['ReclamationstatusApp'].comboStore.setBaseParam('entityid', config.app_entityid);
                            window['ReclamationstatusApp'].comboStore.params = window['ReclamationstatusApp'].comboStore.baseParams;
                            syncLoad([window['ReclamationstatusApp'].comboStore], finalFn);
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
                                            var records = window['ReclamationstatusApp'].gridPanel.getSelectionModel().getSelections();
											
                                            var array = new Array();
                                            for (var i=0; i<records.length; i++)
                                                array.push(records[i].get('id'));
												
                                            new Ext.data.Connection().request({
                                                url: config.app_host + '/reclamationstatus/request/method/delete',
                                                params: {
                                                    ids: Ext.encode(array)
                                                },
                                                failure: requestFailed,
                                                success: requestSuccessful,
                                                callback : function(options, success, response) {
                                                    var object = Ext.decode(response.responseText);
                                                    if(object.success){
                                                        window['ReclamationstatusApp'].store.load({
                                                            params:{
                                                                start: window['ReclamationstatusApp'].gridPanel.getBottomToolbar().cursor
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
                            window['ReclamationstatusApp'].gridPanel.filters.clearFilters();
                            Ext.fly(window['ReclamationstatusApp'].infoTextItem.getEl()).update('');
                            window['ReclamationstatusApp'].gridPanel.getSelectionModel().clearSelections();
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
                url: config.app_host + '/reclamationstatus/request/method/save',
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
                        store: this.reclamationStatusSelectedComboStore,
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
                            fieldLabel:  bundle.getMsg('reclamation.field.completestatus'),
                            xtype:'checkbox',
                            name: 'iscomplete',
                            boxLabel: bundle.getMsg('reclamation.field.iscomplete')                               
                        }]
                    },{
                        columnWidth:.5,
                        layout: 'form',
                        items: [{
                            xtype:'checkbox',
                            name: 'issuspended',
                            boxLabel: bundle.getMsg('reclamation.field.issuspended')                               
                        }]
                    }]
                }]
            });

        },

        showWindow : function(animateTarget, hideApply, callback){
            
            window['ReclamationstatusApp'].window = App.showWindow(bundle.getMsg('reclamationstatus.window.title'), 370, 460, window['ReclamationstatusApp'].formPanel, 
                function(button){
                    if(!button){
                        button = new Object;
                        button.id = window['ReclamationstatusApp'].window.submitBtn.id;
                    }
                    var record = window['ReclamationstatusApp'].gridPanel.getSelectionModel().getSelected();
							
                    window['ReclamationstatusApp'].formPanel.getForm().submit({
                        waitTitle : bundle.getMsg('app.msg.wait.title'), 
                        waitMsg: bundle.getMsg('app.msg.wait.text'), 
                        clientValidation: true,
                        params: {
                            id: record ? record.get('id') : '',
                            entityid: config.app_entityid
                        },
                        success: function(form, action) {
                            checkSesionExpired(form, action);
                            window['ReclamationstatusApp'].store.load({
                                params:{
                                    start: window['ReclamationstatusApp'].gridPanel.getBottomToolbar().cursor
                                }
                            });
                            
                            submitFormSuccessful('ReclamationstatusApp', form, action, button, !record, function(){
                                
                                }, callback);
                        },
                        failure: loadFormFailed
                    });
                
                },
                function(){
                    window['ReclamationstatusApp'].formPanel.getForm().reset();
                    window['ReclamationstatusApp'].window.hide();
                },
                animateTarget,
                false,
                false,
                false,
                hideApply ? hideApply : false);
        }, 
		
        applySecurity : function(groups, permissions){
            window['ReclamationstatusApp'].gridPanel.addBtn.setVisible(permissions.indexOf('managereclamationstatus') != -1 || permissions.indexOf('managereclamationstatusadd') != -1);
            window['ReclamationstatusApp'].gridPanel.updateBtn.setVisible(permissions.indexOf('managereclamationstatus') != -1 || permissions.indexOf('managereclamationstatusedit') != -1);
            window['ReclamationstatusApp'].gridPanel.removeBtn.setVisible(permissions.indexOf('managereclamationstatus') != -1 || permissions.indexOf('managereclamationstatusdelete') != -1);
        }
    }
}();