/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage contract
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */

ContractApp = function() {
    return {
        init : function(ContractApp) {
            
            this.store = new Ext.data.GroupingStore({
                url: config.app_host + '/contract/request/method/load',
                baseParams:{
                    component: 'grid',
                    start: 0,
                    entityid: config.app_entityid,
                    limit: config.app_elementsongrid
                },
                groupField: 'providerid',
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('contract.tab.label').toLowerCase());
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });
            
            this.comboStore = new Ext.data.Store({
                url: config.app_host + '/contract/request/method/load',
                baseParams:{
                    entityid: config.app_entityid,
                    component: 'combo'
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('contract.tab.label').toLowerCase());
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
                },{
                    type: 'string',
                    dataIndex: 'Contracttype'
                },{
                    type: 'string',
                    dataIndex: 'Area'
                },{
                    type: 'string',
                    dataIndex: 'Contractstatus'
                },{
                    type: 'string',
                    dataIndex: 'counterpart'
                }]
            });
            
            this.infoTextItem = new Ext.Toolbar.TextItem('');
            
            this.gridPanel = new Ext.grid.GridPanel({
                id: 'gridPanelContract',
                region:'center',
                layout: 'fit', 
                iconCls: Ext.ux.Icon('tag_orange'),
                title: config.app_showgridtitle ? bundle.getMsg("contract.grid.title") : '',
                autoExpandColumn: 'contractcolname',
                store: this.store,
                loadMask: true,
                tools: [{
                    id:'print',
                    qtip: bundle.getMsg('app.languaje.report.printview'),
                    handler: function() {
                        App.printView(window['ContractApp'].gridPanel);
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
                        var text = App.getFiltersText(window['ContractApp'].gridPanel);
                        if(text && text!=''){
                            Ext.fly(window['ContractApp'].infoTextItem.getEl()).update(String.format(bundle.getMsg('app.form.filteringby'), text));
                            window['ContractApp'].infoTextItem.getEl().highlight('#FFFF66', {
                                block:true
                            });
                        }
                        else
                            Ext.fly(window['ContractApp'].infoTextItem.getEl()).update('');
                    }
                },
                
                columns: [{
                    header: bundle.getMsg('contract.field.name'), 
                    width: 60, 
                    sortable: true, 
                    dataIndex: 'name'
                },{
                    header: bundle.getMsg('contracttype.field.label'), 
                    width: 60, 
                    sortable: true, 
                    dataIndex: 'Contracttype'
                },{
                    id:'contractcolname', 
                    header: bundle.getMsg('entity.field.label'), 
                    width: 360, 
                    sortable: true, 
                    dataIndex: 'counterpart'
                },{
                    header: bundle.getMsg('area.field.label'), 
                    width: 120, 
                    sortable: true, 
                    dataIndex: 'Area'
                },{
                    header: bundle.getMsg('contractstatus.field.label'), 
                    width: 60, 
                    sortable: true, 
                    dataIndex: 'Contractstatus'
                },{
                    header: bundle.getMsg('contract.field.condition'), 
                    width: 40, 
                    sortable: true, 
                    hidden: true, 
                    dataIndex: 'providerid',
                    renderer: function(value) {
                        var str = bundle.getMsg('contract.field.client');
                        if(value == config.app_entityid)
                            str = bundle.getMsg('contract.field.provider');
                        return str;
                    }
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
                            window['ContractApp'].gridPanel.getSelectionModel().clearSelections();
                            window['ContractApp'].gridPanel.updateBtn.fireEvent('click', button, eventObject, hideApply, callback);
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
                            
                            window['ContractApp'].formPanel.tabPanel.generalPanel.metadataDisplayField.setValue('');
                            
                            var finalFn = function(){
                                window['ContractApp'].formPanel.tabPanel.suplementsPanel.setDisabled(true);
                                window['ContractApp'].formPanel.tabPanel.reclamationsPanel.setDisabled(true);
                                window['ContractApp'].formPanel.tabPanel.notesPanel.setDisabled(true);
                                window['ContractApp'].formPanel.tabPanel.filesPanel.setDisabled(true);
                                
                                var record = window['ContractApp'].gridPanel.getSelectionModel().getSelected();
                                if (record){
                                    window['ContractApp'].clientRecord = new Ext.data.Record(record.get('Client'));
                                    window['ContractApp'].clientRecord.id = window['ContractApp'].clientRecord.data.id;
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.clientCombo.getStore().add(new Ext.data.Record(record.get('Client')));
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.clientCombo.setRawValue(record.get('Client').name);
                                    
                                    window['ContractApp'].providerRecord = new Ext.data.Record(record.get('Provider'));
                                    window['ContractApp'].providerRecord.id = window['ContractApp'].providerRecord.data.id;
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.clientCombo.getStore().add(new Ext.data.Record(record.get('Provider')));
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.providerCombo.setRawValue(record.get('Provider').name);
                                    
                                    window['ContractApp'].populatePaymentWaysCombo(window['ContractApp'].providerRecord, record.data.paymentwayid);
                                    window['ContractApp'].populatePaymentPlacesCombo(window['ContractApp'].providerRecord, record.data.paymentplaceid);
                                    
                                    var afterLoadUsersFn = function(){
                                        window['ContractApp'].formPanel.tabPanel.generalPanel.metadataDisplayField.setValue(
                                            bundle.getMsg('app.layout.created')+': '+record.json.created_at);
                                        window['ContractApp'].formPanel.tabPanel.generalPanel.doLayout();
                                        
                                        record.set('manuallyprogrammed', true); // IMPORTANT, do not delete!
                                        window['ContractApp'].formPanel.getForm().loadRecord(record);
                                        
                                        if(record.get('Event').start && record.get('Event').start!='' && record.get('Event').start!='0000-00-00 00:00:00'){
                                            Ext.getCmp('contractstartDateField').setValue(Date.parseDate(record.get('Event').start, Date.patterns.ISO8601Long));
                                            Ext.getCmp('contractstartDateField').fireEvent('select', Ext.getCmp('contractstartDateField'));
                                        }
                                        if(record.get('Event').end && record.get('Event').end!='' && record.get('Event').end!='0000-00-00 00:00:00')
                                            Ext.getCmp('contractendDateField').setValue(Date.parseDate(record.get('Event').end, Date.patterns.ISO8601Long));
                                    
                                        if(record.get('contracttypeid') && record.get('contracttypeid')!='')
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.contracttypeCombo.setValue(record.get('contracttypeid'));
                                        if(record.get('areaid') && record.get('areaid')!='')
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.areaCombo.setValue(record.get('areaid'));
                                        if(record.get('contractstatusid') && record.get('contractstatusid')!='')
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.contractstatusCombo.setValue(record.get('contractstatusid'));
                                        if(record.get('provideruserid') && record.get('provideruserid')!=''){
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.setValue(record.get('provideruserid'));
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.setDisabled(false);
                                        }
                                        if(record.get('clientuserid') && record.get('clientuserid')!=''){
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.setValue(record.get('clientuserid'));
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.setDisabled(false);
                                        }
                                                                        
                                        window['ContractApp'].formPanel.tabPanel.suplementsPanel.setDisabled(false);
                                        window['ContractApp'].suplementsPanel.items.items[0].getBottomToolbar().store.baseParams.entityid = record.get('Event').id;
                                        window['ContractApp'].suplementsPanel.items.items[0].getBottomToolbar().store.load({
                                            params:{
                                                start: window['ContractApp'].suplementsPanel.items.items[0].getBottomToolbar().cursor
                                            }
                                        });
                                        
                                        window['ContractApp'].formPanel.tabPanel.reclamationsPanel.setDisabled(false);
                                        window['ContractApp'].reclamationsPanel.items.items[0].getBottomToolbar().store.baseParams.entityid = record.get('Event').id;
                                        window['ContractApp'].reclamationsPanel.items.items[0].getBottomToolbar().store.load({
                                            params:{
                                                start: window['ContractApp'].reclamationsPanel.items.items[0].getBottomToolbar().cursor
                                            }
                                        });
                                                                        
                                        window['ContractApp'].formPanel.tabPanel.notesPanel.setDisabled(false);
                                        window['ContractApp'].notesPanel.items.items[0].getBottomToolbar().store.baseParams.entityid = record.get('id');
                                        window['ContractApp'].notesPanel.items.items[0].getBottomToolbar().store.load({
                                            params:{
                                                start: window['ContractApp'].notesPanel.items.items[0].getBottomToolbar().cursor
                                            }
                                        });
                                    
                                        window['ContractApp'].formPanel.tabPanel.filesPanel.setDisabled(false);
                                        window['ContractApp'].filesPanel.getLoader().baseParams.path = 'web/uploads/docs/Contract/' + record.get('id');
                                        window['ContractApp'].filesPanel.getRootNode().removeAll();
                                        window['ContractApp'].filesPanel.getLoader().load(window['ContractApp'].filesPanel.getRootNode());
                                        
                                        // this is used to pass to controller a custom value to the function that use reflection to manipulate a value									
                                        window['ContractApp'].suplementsPanel.contentEditor.hiddenField.setValue(record.get('Event').id);
                                        window['ContractApp'].reclamationsPanel.contentEditor.hiddenField.setValue(record.get('Event').id);
                                    };
                                    
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.getStore().baseParams.entityid = window['ContractApp'].clientRecord.id;
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.getStore().baseParams.entityid = window['ContractApp'].providerRecord.id;
                                    
                                    syncLoad([
                                        window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.getStore(),
                                        window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.getStore()
                                        ], afterLoadUsersFn);
                                    
                                    window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.store.removeAll();
                                    var paymentinstruments = Ext.decode(record.get('paymentinstruments'));
                                    for(var i = 0; paymentinstruments && i < paymentinstruments.length; i++)
                                        window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.store.add(new Ext.data.Record(paymentinstruments[i]));
                                    
                                }
                                else
                                    window['ContractApp'].formPanel.getForm().reset();
                                window['ContractApp'].showWindow(button.getEl(), hideApply, callback);
                                App.mask.hide();
                            };
                            
                            syncLoad([
                                window['ContractApp'].formPanel.tabPanel.generalPanel.contracttypeCombo.store,
                                window['ContractApp'].formPanel.tabPanel.generalPanel.areaCombo.store,
                                window['ContractApp'].formPanel.tabPanel.generalPanel.contractstatusCombo.store
                                ], finalFn);
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
                                            var records = window['ContractApp'].gridPanel.getSelectionModel().getSelections();
                                            
                                            var array = new Array();                                
                                            for (var i=0; i<records.length; i++)
                                                array.push(records[i].get('id'));
                                                
                                            new Ext.data.Connection().request({
                                                url: config.app_host + '/contract/request/method/delete',
                                                params: {
                                                    ids: Ext.encode(array)
                                                },
                                                failure: requestFailed,
                                                success: requestSuccessful,
                                                callback : function(options, success, response) {
                                                    var object = Ext.decode(response.responseText);
                                                    if(object.success){
                                                        window['ContractApp'].store.load({
                                                            params:{
                                                                start: window['ContractApp'].gridPanel.getBottomToolbar().cursor
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
                }, '->',{
                    ref: '../printBtn',
                    text: bundle.getMsg('contract.action.generatedocument'),
                    disabled: true,
                    iconCls: Ext.ux.Icon('page_white_text'),
                    listeners: {
                        click: function(button, eventObject, hideApply, callback) {
                            showValueForm('ContractApp', new Ext.form.ClearableCombo({
                                store: window['FormatApp'].comboStore,
                                valueField: 'id', 
                                displayField: 'name',
                                typeAhead: true,
                                forceSelection: true,
                                mode: 'local',
                                triggerAction: 'all',
                                selectOnFocus:true,
                                fieldLabel: bundle.getMsg('contract.action.selectformat')+'<span style="color:red;"><sup>*</sup></span>', 
                                emptyText: bundle.getMsg('app.form.select'),
                                allowBlank: false,
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
                                anchor:'-20',
                                listeners: {
                                    focus: function(combo) {
                                        if(!combo.readOnly && !combo.disabled){
                                            combo.getStore().baseParams.entityid = config.app_entityid;
                                            combo.getStore().load();
                                        }
                                    }
                                }
                            }), function(form){
                                var value = form.items.items[0].getValue();
                                var record = window['ContractApp'].gridPanel.getSelectionModel().getSelected();
                                App.printView('/contract/request/method/load/component/report/format/'+value+'/id/'+record.get('id'), ' ', ' ');
                            },  button.getEl());
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
                            window['ContractApp'].gridPanel.filters.clearFilters();
                            Ext.fly(window['ContractApp'].infoTextItem.getEl()).update('');
                            window['ContractApp'].gridPanel.getSelectionModel().clearSelections();
                        } 
                    },'-', this.infoTextItem],
                    displayInfo: true,
                    displayMsg: bundle.getMsg('app.form.bbar.displaymsg'),
                    emptyMsg: String.format(bundle.getMsg('app.form.bbar.emptymsg'), bundle.getMsg('app.form.elements').toLowerCase())
                }),
                
                sm: new Ext.grid.RowSelectionModel({
                    singleSelect:false, 
                    listeners: {
                        selectionchange: function(selectionModel){
                            App.selectionChange(selectionModel);
                            
                            selectionModel.grid.printBtn.setDisabled(selectionModel.getCount() != 1);
                        }
                    }
                })
            });
            
            this.gridPanel.getView().getRowClass = function(record, index, rowParams, store) {
                if (!record.get('deleteable')) 
                    return 'row-italic';
            };
            //entity, table, tableid, layout
            this.notesPanel = window['NoteApp'].getPanelFor('Contract', 'ContractNotes', config.app_entityid, {
                label:{
                    newnote: bundle.getMsg('contract.field.newopinion')
                },
                icon: {
                    add: 'note_add',
                    reply: 'note_edit',
                    del: 'note_delete'
                }
            });
            this.reclamationsPanel = window['NoteApp'].getPanelFor('Contract', 'ContractReclamations', config.app_entityid, {
                label:{
                    newnote: bundle.getMsg('reclamation.action.newcomment.defaultname')
                },
                icon: {
                    add: 'comment_add',
                    reply: 'comment',
                    edit: 'comment_edit',
                    del: 'comment_delete'
                },
                hidebbarfn: function(record){
                    return record.get('ident')>1;
                },
                template: '<div class="thumb-wrap" style="width:96%;">\
                                    <div style="width:{identleft}%;float:left;"></div>\
                                    <div style="width:{identright}%;float:right;text-align:justify;">\
                                        {avatarinit}\
                                        <span><span style="font-size:20px;"><b>{number}</b></span>{separator}{date}{separator}<b>{type}</b>{separator}{full_name}</span>\
                                        <hr/>{shortcomment}<br/>\
                                        <div style="float:right;">{toolbar}</div>\
                                        {avatarend}\
                                    </div>\
                                </div>',
                prepareFn: function(data){
                    data.json = Ext.decode(data.json);
                    if(data.json){
                        if(data.json[2][0] && data.json[2][0]!=''){
                            data.date = data.json[2][0];
                            data.separator = ' | ';
                        }
                        if(data.json[2][1] && data.json[2][1]!=''){
                            data.type = data.json[2][1];
                            data.separator = ' | ';
                        }
                        if(data.json[2][2] && data.json[2][2]!=''){
                            data.number = data.json[2][2];
                            data.separator = ' | ';
                        }
                    }
                    
                    if(data.comment.length < 200)
                        data.shortcomment = data.comment;
                    else
                        data.shortcomment = String.format(bundle.getMsg('reclamation.action.editcomment.longcomment')+'...', data.number);
                    
                    
                    return data;
                },
                bbar: [new Ext.Toolbar.TextItem(bundle.getMsg('app.form.date')+'<span style="color:red;"><sup>*</sup></span>: '), {
                    name:'dateField',
                    xtype:'datefield',
                    ref: '../dateField',
                    allowBlank: false,
                    width: 80
                }, {
                    xtype: 'tbspacer', 
                    width: 70
                }, new Ext.Toolbar.TextItem(bundle.getMsg('reclamation.field.reclamationtype')+'<span style="color:red;"><sup>*</sup></span>: '), new Ext.form.ClearableCombo({
                    name: 'reclamationtypeCombo',
                    ref: '../reclamationtypeCombo',
                    width: 160,
                    store: window['ReclamationtypeApp'].comboStore,
                    valueField: 'id', 
                    displayField: 'name',
                    tpl: '<tpl for="."><div ext:qtip="{name}:{comment}" class="x-combo-list-item">{name}</div></tpl>',
                    typeAhead: true,
                    forceSelection: true,
                    allowBlank: false,
                    mode: 'local',
                    triggerAction: 'all',
                    selectOnFocus:true,
                    emptyText: bundle.getMsg('app.form.select'),
                    triggerConfig: {
                        tag:'span', 
                        cls:'x-form-twin-triggers', 
                        style:'padding-right:2px',
                        cn:[{
                            tag: "img", 
                            src: Ext.BLANK_IMAGE_URL, 
                            cls: "x-form-trigger"
                        },{
                            tag: "img", 
                            src: Ext.BLANK_IMAGE_URL, 
                            cls: "x-form-trigger x-form-plus-trigger"
                        }]
                    },
                    listeners: {
                        focus: function(combo) {
                            if(!combo.readOnly && !combo.disabled)
                                combo.getStore().load();
                        }
                    },
                    onTrigger2Click: function(){ 
                        var obj = new Object;
                        obj.params = [window['ContractApp'].reclamationsPanel.contentEditor.reclamationtypeCombo];
                        obj.fn = function(params){
                            var cmp = params[0];
                            var obj = params[1];
                            var mask = new Ext.LoadMask(window['ReclamationtypeApp'].window.getEl(), {
                                msg: bundle.getMsg('app.layout.loading')+'...'
                            });
                            mask.show();
                            cmp.store.load({
                                callback: function(records, options, success){
                                    var record = cmp.getStore().getAt(cmp.getStore().find('id',obj.data.id, 0, true, true));								 
                                    if(record)
                                        cmp.setValue(obj.data.id);
                                    mask.hide();
                                }
                            });
                        };
                        window['ReclamationtypeApp'].gridPanel.getSelectionModel().clearSelections();
                        window['ReclamationtypeApp'].showWindow(window['ReclamationtypeApp'].window.getEl(), true, obj);
                    }
                }), {
                    xtype: 'tbspacer', 
                    width: 170
                }, new Ext.Toolbar.TextItem(bundle.getMsg('reclamation.field.number')+': '), {
                    xtype:'textfield',
                    name:'numberField',
                    ref: '../numberField',
                    // this is used to pass to controller a custom function to use with reflection to manipulate the field value
                    anchor: 'Contract::getReclamationNumber',
                    width: 70
                }, new Ext.form.Hidden({
                    xtype:'hiddenfield',
                    name:'hiddenField',
                    ref: '../hiddenField'
                }), {
                    xtype: 'tbspacer', 
                    width: 10
                }, new Ext.Toolbar.TextItem(bundle.getMsg('reclamation.field.receptiondate')+'<span style="color:red;"></span>: '), {
                    name:'receptiondateField',
                    xtype:'datefield',
                    ref: '../receptiondateField',
                    width: 80
                },{
                    xtype: 'tbspacer', 
                    width: 80
                }, new Ext.Toolbar.TextItem(bundle.getMsg('reclamationstatus.field.label')+'<span style="color:red;"></span>: '), new Ext.form.ClearableCombo({
                    name:'reclamaionstatusCombo',
                    ref: '../reclamaionstatusCombo',
                    width: 140,
                    store: new Ext.data.Store({
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
                    }),
                    valueField: 'id', 
                    displayField: 'name',
                    tpl: '<tpl for="."><div ext:qtip="{name}" class="x-combo-list-item"><div class="mail-calendar-cat-color ext-cal-picker-icon" style="background-color:#{customcolor}"></div>{name}</div></tpl>',
                    typeAhead: true,
                    forceSelection: true,
                    mode: 'local',
                    triggerAction: 'all',
                    selectOnFocus:true,
                    emptyText: bundle.getMsg('app.form.select'),
                    triggerConfig: {
                        tag:'span', 
                        cls:'x-form-twin-triggers', 
                        style:'padding-right:2px',
                        cn:[{
                            tag: "img", 
                            src: Ext.BLANK_IMAGE_URL, 
                            cls: "x-form-trigger"
                        },{
                            tag: "img", 
                            src: Ext.BLANK_IMAGE_URL, 
                            cls: "x-form-trigger x-form-plus-trigger"
                        }]
                    },
                    listeners: {
                        focus: function(combo) {
                            combo.getStore().load({
                                params:{
                                    entityid: config.app_entityid,
                                    restriction: 'onlyparents'
                                }
                            });
                        }
                    },
                    onTrigger2Click: function(){ 
                        var finalFn = function(){
                            var obj = new Object;
                            obj.params = [window['ContractApp'].reclamationsPanel.contentEditor.reclamaionstatusCombo];
                            obj.fn = function(params){
                                var cmp = params[0];
                                var obj = params[1];
                                var mask = new Ext.LoadMask(window['ReclamationstatusApp'].window.getEl(), {
                                    msg: bundle.getMsg('app.layout.loading')+'...'
                                });
                                mask.show();
                                cmp.store.load({
                                    callback: function(records, options, success){
                                        var record = cmp.getStore().getAt(cmp.getStore().find('id',obj.data.id, 0, true, true));								 
                                        if(record)
                                            cmp.setValue(obj.data.id);
                                        mask.hide();
                                    }
                                });
                            };
                            window['ReclamationstatusApp'].gridPanel.getSelectionModel().clearSelections();
                            window['ReclamationstatusApp'].showWindow(window['ReclamationstatusApp'].window.getEl(), true, obj);
                                    
                            App.mask.hide();
                        };
                            
                        window['ReclamationstatusApp'].comboStore.setBaseParam('distinct', '');
                        window['ReclamationstatusApp'].comboStore.setBaseParam('entityid', config.app_entityid);
                        window['ReclamationstatusApp'].comboStore.params = window['ReclamationstatusApp'].comboStore.baseParams;                                
                        syncLoad([window['ReclamationstatusApp'].comboStore], finalFn);
                    }
                }),{
                    xtype: 'tbspacer', 
                    width: 60
                }]
            });
            this.suplementsPanel = window['NoteApp'].getPanelFor('Contract', 'ContractSuplements', config.app_entityid, {
                label:{
                    newnote: bundle.getMsg('suplement.action.newcomment.defaultname')
                },
                hidereply: true,
                icon: {
                    add: 'page_add',
                    reply: 'page_edit',
                    edit: 'page_edit',
                    del: 'page_delete'
                },
                template: '<div class="thumb-wrap" style="width:96%;">\
                                    <div style="width:{identleft}%;float:left;"></div>\
                                    <div style="width:{identright}%;float:right;text-align:justify;">\
                                        <span><span style="font-size:20px;"><b>{type}</b></span>{separator}{date}</span>\
                                        <hr/>{shortcomment}<br/>\
                                        <div style="float:right;">{toolbar}</div>\
                                        {avatarend}\
                                    </div>\
                                </div>',
                prepareFn: function(data){
                    data.json = Ext.decode(data.json);
                    if(data.json){
                        if(data.json[2][0] && data.json[2][0]!=''){
                            data.date = data.json[2][0];
                            data.separator = ' | ';
                        }
                        if(data.json[2][1] && data.json[2][1]!=''){
                            data.type = data.json[2][1];
                            data.separator = ' | ';
                        }
                    }
                
                    if(data.comment.length<200)
                        data.shortcomment = data.comment;
                    else
                        data.shortcomment = String.format(bundle.getMsg('suplement.action.editcomment.longcomment')+'...', data.type, '<a href="#" onclick="javascript:Ext.getCmp(&#39;'+window['ContractApp'].suplementsPanel.id+'&#39;).editFn(&#39;'+window['ContractApp'].suplementsPanel.id+'&#39;,&#39;'+data.id+'&#39;,false);">', '</a>');
                    
                    return data;
                },
                bbar: [new Ext.Toolbar.TextItem(bundle.getMsg('app.form.date')+'<span style="color:red;"><sup>*</sup></span>: '), {
                    name:'dateField',
                    xtype:'datefield',
                    ref: '../dateField',
                    allowBlank: false,
                    width: 90
                },{
                    xtype: 'tbspacer', 
                    width: 100
                }, new Ext.Toolbar.TextItem(bundle.getMsg('reclamation.field.number')+': '), {
                    xtype:'textfield',
                    name:'numberField',
                    ref: '../numberField',
                    // this is used to pass to controller a custom function to use with reflection to manipulate the field value
                    anchor: 'Contract::getSuplementNumber',
                    width: 70
                }, new Ext.form.Hidden({
                    xtype:'hiddenfield',
                    name:'hiddenField',
                    ref: '../hiddenField'
                })]
            });
            
            this.filesPanel = window['ExplorerApp'].getPanelFor('Contract', 'Contract', config.app_entityid, {
                path: 'web/uploads/docs'
            }); 
            
            this.formPanel = new Ext.FormPanel({
                labelWidth: 75,
                labelAlign: 'top',
                url: config.app_host + '/contract/request/method/save',
                keys: [formKeyMaping],	
                border: false,
                items: [new Ext.TabPanel({
                    ref: 'tabPanel',
                    deferredRender: false,
                    height: 413,
                    defaults:{
                        autoHeight:false
                    }, 			
                    activeTab: 0,
                    border:false,
                    items:[{
                        ref: 'generalPanel',
                        title: bundle.getMsg('app.form.generaldata'),	
                        border:false,
                        bodyStyle: 'padding:5px',
                        bbar: ['->',{
                            ref: '../metadataDisplayField',
                            xtype: 'displayfield', 
                            value: 'hola mundo'
                        }],
                        listeners: {
                            activate: function() { 
                                if(permissions.indexOf('managecontracttype') == -1 && permissions.indexOf('managecontracttypeadd') == -1)
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.contracttypeCombo.getTrigger(1).hide();
                                if(permissions.indexOf('managearea') == -1 && permissions.indexOf('manageareaadd') == -1)
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.areaCombo.getTrigger(1).hide();
                                if(permissions.indexOf('managearea') == -1 && permissions.indexOf('manageareaadd') == -1)
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.areaCombo.getTrigger(1).hide();
                                if(permissions.indexOf('managecontractstatus') == -1 && permissions.indexOf('managecontractstatusadd') == -1)
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.contractstatusCombo.getTrigger(1).hide();
                                if(permissions.indexOf('manageperson') == -1 && permissions.indexOf('managemanagepersonadd') == -1){
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.getTrigger(1).hide();
                                    window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.getTrigger(1).hide();
                                }
                                
                                window['ContractApp'].disposeWindowsButtons();
                            }
                        },
                        items: [{
                            layout:'column',
                            border: false,
                            defaults:{
                                border:false
                            }, 	
                            items:[{
                                columnWidth:.15,
                                layout: 'form',
                                items: [{
                                    xtype:'textfield',
                                    ref: '../../contractnameField',
                                    name: 'name',
                                    fieldLabel: bundle.getMsg('contract.field.name'), 
                                    anchor:'-20'
                                }]
                            },{
                                columnWidth:.25 ,
                                layout: 'form',
                                items: [new Ext.form.ClearableCombo({
                                    ref: '../../contracttypeCombo',
                                    fieldLabel: bundle.getMsg('contracttype.field.label')+'<span style="color:red;"><sup>*</sup></span>',
                                    anchor: '-20',
                                    store: window['ContracttypeApp'].comboStore,
                                    valueField: 'id', 
                                    displayField: 'name',
                                    tpl: '<tpl for="."><div ext:qtip="{name}:{comment}" class="x-combo-list-item">{name}</div></tpl>',
                                    typeAhead: true,
                                    forceSelection: true,
                                    mode: 'local',
                                    triggerAction: 'all',
                                    selectOnFocus:true,
                                    emptyText: bundle.getMsg('app.form.select'),
                                    allowBlank: false,
                                    triggerConfig: {
                                        tag:'span', 
                                        cls:'x-form-twin-triggers', 
                                        style:'padding-right:2px',
                                        cn:[{
                                            tag: "img", 
                                            src: Ext.BLANK_IMAGE_URL, 
                                            cls: "x-form-trigger"
                                        },{
                                            tag: "img", 
                                            src: Ext.BLANK_IMAGE_URL, 
                                            cls: "x-form-trigger x-form-plus-trigger"
                                        }]
                                    },
                                    listeners: {
                                        focus: function(combo) {
                                            if(!combo.readOnly && !combo.disabled)
                                                combo.getStore().load();
                                        }
                                    },
                                    onTrigger2Click: function(){ 
                                        var obj = new Object;
                                        obj.params = [window['ContractApp'].formPanel.tabPanel.generalPanel.contracttypeCombo];
                                        obj.fn = function(params){
                                            var cmp = params[0];
                                            var obj = params[1];
                                            var mask = new Ext.LoadMask(window['ContracttypeApp'].window.getEl(), {
                                                msg: bundle.getMsg('app.layout.loading')+'...'
                                            });
                                            mask.show();
                                            cmp.store.load({
                                                callback: function(records, options, success){
                                                    var record = cmp.getStore().getAt(cmp.getStore().find('id',obj.data.id, 0, true, true));								 
                                                    if(record)
                                                        cmp.setValue(obj.data.id);
                                                    mask.hide();
                                                }
                                            });
                                        };
                                        window['ContracttypeApp'].gridPanel.getSelectionModel().clearSelections();
                                        window['ContracttypeApp'].showWindow(window['ContracttypeApp'].window.getEl(), true, obj);
                                    }
                                })]
                            },{
                                columnWidth:.35,
                                layout: 'form',
                                items: [new Ext.form.ClearableCombo({
                                    ref: '../../areaCombo',
                                    fieldLabel: bundle.getMsg('area.field.label')+'<span style="color:red;"><sup>*</sup></span>',
                                    anchor: '-20',
                                    store: window['AreaApp'].comboStore,
                                    valueField: 'id', 
                                    displayField: 'name',
                                    tpl: '<tpl for="."><div ext:qtip="{name}:{comment}" class="x-combo-list-item">{name}</div></tpl>',
                                    typeAhead: true,
                                    forceSelection: true,
                                    mode: 'local',
                                    triggerAction: 'all',
                                    selectOnFocus:true,
                                    emptyText: bundle.getMsg('app.form.select'),
                                    allowBlank: false,
                                    triggerConfig: {
                                        tag:'span', 
                                        cls:'x-form-twin-triggers', 
                                        style:'padding-right:2px',
                                        cn:[{
                                            tag: "img", 
                                            src: Ext.BLANK_IMAGE_URL, 
                                            cls: "x-form-trigger"
                                        },{
                                            tag: "img", 
                                            src: Ext.BLANK_IMAGE_URL, 
                                            cls: "x-form-trigger x-form-plus-trigger"
                                        }]
                                    },
                                    listeners: {
                                        focus: function(combo) {
                                            if(!combo.readOnly && !combo.disabled)
                                                combo.getStore().load();
                                        }
                                    },
                                    onTrigger2Click: function(){ 
                                        var obj = new Object;
                                        obj.params = [window['ContractApp'].formPanel.tabPanel.generalPanel.areaCombo];
                                        obj.fn = function(params){
                                            var cmp = params[0];
                                            var obj = params[1];
                                            var mask = new Ext.LoadMask(window['AreaApp'].window.getEl(), {
                                                msg: bundle.getMsg('app.layout.loading')+'...'
                                            });
                                            mask.show();
                                            cmp.store.load({
                                                callback: function(records, options, success){
                                                    var record = cmp.getStore().getAt(cmp.getStore().find('id',obj.data.id, 0, true, true));								 
                                                    if(record)
                                                        cmp.setValue(obj.data.id);
                                                    mask.hide();
                                                }
                                            });
                                        };
                                        window['AreaApp'].gridPanel.getSelectionModel().clearSelections();
                                        window['AreaApp'].showWindow(window['AreaApp'].window.getEl(), true, obj);
                                    }
                                })]
                            },{
                                columnWidth:.25,
                                layout: 'form',
                                items: [new Ext.form.ClearableCombo({
                                    ref: '../../contractstatusCombo',
                                    fieldLabel: bundle.getMsg('contractstatus.field.label')+'<span style="color:red;"><sup>*</sup></span>',
                                    anchor: '-20',
                                    store: new Ext.data.Store({
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
                                    }),
                                    valueField: 'id', 
                                    displayField: 'name',
                                    tpl: '<tpl for="."><div ext:qtip="{name}" class="x-combo-list-item"><div class="mail-calendar-cat-color ext-cal-picker-icon" style="background-color:#{customcolor}"></div>{name}</div></tpl>',
                                    typeAhead: true,
                                    forceSelection: true,
                                    mode: 'local',
                                    triggerAction: 'all',
                                    selectOnFocus:true,
                                    emptyText: bundle.getMsg('app.form.select'),
                                    allowBlank: false,
                                    triggerConfig: {
                                        tag:'span', 
                                        cls:'x-form-twin-triggers', 
                                        style:'padding-right:2px',
                                        cn:[{
                                            tag: "img", 
                                            src: Ext.BLANK_IMAGE_URL, 
                                            cls: "x-form-trigger"
                                        },{
                                            tag: "img", 
                                            src: Ext.BLANK_IMAGE_URL, 
                                            cls: "x-form-trigger x-form-plus-trigger"
                                        }]
                                    },
                                    listeners: {
                                        focus: function(combo) {
                                            var record = window['ContractApp'].gridPanel.getSelectionModel().getSelected();
                                            if (record)
                                                combo.getStore().load({
                                                    params:{
                                                        entityid: config.app_entityid,
                                                        restriction: 'next',
                                                        id: record.get('contractstatusid')
                                                    }
                                                });
                                            else
                                                combo.getStore().load({
                                                    params:{
                                                        entityid: config.app_entityid,
                                                        restriction: 'onlyparents'
                                                    }
                                                });
                                        }
                                    },
                                    onTrigger2Click: function(){ 
                                        var finalFn = function(){
                                            var obj = new Object;
                                            obj.params = [window['ContractApp'].formPanel.tabPanel.generalPanel.contractstatusCombo];
                                            obj.fn = function(params){
                                                var cmp = params[0];
                                                var obj = params[1];
                                                var mask = new Ext.LoadMask(window['ContractstatusApp'].window.getEl(), {
                                                    msg: bundle.getMsg('app.layout.loading')+'...'
                                                });
                                                mask.show();
                                                cmp.store.load({
                                                    callback: function(records, options, success){
                                                        var record = cmp.getStore().getAt(cmp.getStore().find('id',obj.data.id, 0, true, true));								 
                                                        if(record)
                                                            cmp.setValue(obj.data.id);
                                                        mask.hide();
                                                    }
                                                });
                                            };
                                            window['ContractstatusApp'].gridPanel.getSelectionModel().clearSelections();
                                            window['ContractstatusApp'].showWindow(window['ContractstatusApp'].window.getEl(), true, obj);
                                    
                                            App.mask.hide();
                                        };
                            
                                        window['ContractstatusApp'].comboStore.setBaseParam('distinct', '');
                                        window['ContractstatusApp'].comboStore.setBaseParam('entityid', config.app_entityid);
                                        window['ContractstatusApp'].comboStore.params = window['ContractstatusApp'].comboStore.baseParams;                                
                                        syncLoad([window['ContractstatusApp'].comboStore], finalFn);
                                    }
                                })]
                            }]
                        },{
                            layout:'column',
                            border: false,
                            defaults:{
                                border:false
                            }, 	
                            items:[{
                                columnWidth:.65,
                                layout: 'form',
                                items: [new Ext.form.ClearableCombo({
                                    ref: '../../clientCombo',
                                    fieldLabel: bundle.getMsg('contract.field.client')+'<span style="color:red;"><sup>*</sup></span>',
                                    anchor: '-20',
                                    store: window['EntityApp'].comboStore,
                                    emptyText: bundle.getMsg('app.form.typehere'),
                                    minChars: 1, //para q busque a partir de 1 caracter...
                                    displayField: 'name',
                                    typeAhead: false,
                                    boxMaxWidth: 3000,   
                                    allowBlank: false,    
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
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.clientCombo.getStore().baseParams.filter = '';
                                            this.setValue(queryEvent.query);
                                        },
                                        select: function(combo, record, index ){
                                            window['ContractApp'].clientRecord = record;
                                            this.collapse();
                                    
                                            if(config.app_multientity && record.get('id') != config.app_multientity.id){
                                                var obj = new Ext.data.Record(config.app_multientity);
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.providerCombo.getStore().add(obj);
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.providerCombo.setRawValue(config.app_multientity.name);
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.providerCombo.clearInvalid();
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.providerCombo.fireEvent('select', window['ContractApp'].formPanel.tabPanel.generalPanel.providerCombo, obj);
                                                
                                                window['ContractApp'].providerRecord = config.app_multientity;
                                                
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.reset();
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.getStore().baseParams.entityid = record.get('id');
                                                window['PersonApp'].window.entityid = record.get('id');
                                                
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.reset();
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.getStore().baseParams.entityid = config.app_multientity.id;
                                                
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.reset();
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.reset();
                                            }
                                            
                                            if(combo.getRawValue() == '')
                                                window['ContractApp'].clientRecord = false;
                                            else {
                                                if(record && record.get('name') == combo.getRawValue())
                                                    window['ContractApp'].clientRecord = record;
                                                else {
                                                    window['ContractApp'].clientRecord = false;
                                                    combo.markInvalid(bundle.getMsg('app.error.fieldinvalid'));
                                                }
                                            }
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.setDisabled(window['ContractApp'].clientRecord == false);
                                            if(window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.disabled)
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.reset();
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
                                })]
                            },{
                                columnWidth:.35,
                                layout: 'form',
                                items: [new Ext.form.ClearableCombo({
                                    ref: '../../clientuserCombo',
                                    fieldLabel: bundle.getMsg('contract.field.user.client')+'<span style="color:red;"><sup>*</sup></span>',
                                    anchor: '-20',
                                    disabled: true,
                                    store: new Ext.data.Store({
                                        url: config.app_host + '/user/request/method/load',
                                        baseParams:{
                                            entityid: config.app_entityid,
                                            filter: '[{"type":"string","value":"legalrepresentant__true","field":"profile"}]',
                                            component: 'combo'
                                        },
                                        reader: new Ext.data.JsonReader(),
                                        listeners: {
                                            load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                                                alertNoRecords(records, bundle.getMsg('user.tab.label').toLowerCase());
                                            },
                                            loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                                        }
                                    }),
                                    valueField: 'id', 
                                    displayField: 'full_name',
                                    typeAhead: true,
                                    forceSelection: true,
                                    mode: 'local',
                                    triggerAction: 'all',
                                    selectOnFocus:true,
                                    emptyText: bundle.getMsg('app.form.select'),
                                    allowBlank: false,
                                    triggerConfig: {
                                        tag:'span', 
                                        cls:'x-form-twin-triggers', 
                                        style:'padding-right:2px',
                                        cn:[{
                                            tag: "img", 
                                            src: Ext.BLANK_IMAGE_URL, 
                                            cls: "x-form-trigger"
                                        },{
                                            tag: "img", 
                                            src: Ext.BLANK_IMAGE_URL, 
                                            cls: "x-form-trigger x-form-plus-trigger"
                                        }]
                                    },
                                    listeners: {
                                        focus: function(combo) {
                                            if(!combo.readOnly && !combo.disabled)
                                                combo.getStore().load();
                                        }
                                    },
                                    onTrigger2Click: function(){ 
                                        if(!window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.disabled){
                                            var obj = new Object;
                                            obj.params = [window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo];
                                            obj.entityid = window['ContractApp'].clientRecord.id;
                                            
                                            obj.fn = function(params){
                                                var cmp = params[0];
                                                var obj = params[1];
                                                var mask = new Ext.LoadMask(window['PersonApp'].window.getEl(), {
                                                    msg: bundle.getMsg('app.layout.loading')+'...'
                                                });
                                                mask.show();
                                                cmp.store.load({
                                                    callback: function(records, options, success){
                                                        var record = cmp.getStore().getAt(cmp.getStore().find('id',obj.data.id, 0, true, true));								 
                                                        if(record)
                                                            cmp.setValue(obj.data.id);
                                                        mask.hide();
                                                    }
                                                });
                                            };
                                            window['PersonApp'].gridPanel.getSelectionModel().clearSelections();
                                            window['PersonApp'].showWindow(window['PersonApp'].window.getEl(), true, obj);
                                        }	
                                    }
                                })]
                            }]
                        }, {
                            layout:'column',
                            border: false,
                            defaults:{
                                border:false
                            }, 	
                            items:[{
                                columnWidth:.65,
                                layout: 'form',
                                items: [new Ext.form.ClearableCombo({
                                    ref: '../../providerCombo',
                                    fieldLabel: bundle.getMsg('contract.field.provider')+'<span style="color:red;"><sup>*</sup></span>',
                                    anchor: '-20',
                                    store: window['EntityApp'].comboStore,
                                    emptyText: bundle.getMsg('app.form.typehere'),
                                    minChars: 1, //para q busque a partir de 1 caracter...
                                    displayField: 'name',
                                    typeAhead: false,
                                    boxMaxWidth: 3000,   
                                    allowBlank: false,    
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
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.providerCombo.getStore().baseParams.filter = '';
                                            this.setValue(queryEvent.query);
                                        },
                                        select: function(combo, record, index ){
                                            window['ContractApp'].providerRecord = record;
                                            this.collapse();
                                            
                                            window['ContractApp'].populatePaymentWaysCombo(window['ContractApp'].providerRecord);
                                            window['ContractApp'].populatePaymentPlacesCombo(window['ContractApp'].providerRecord);
                                    
                                            if(config.app_multientity && record.get('id') != config.app_multientity.id){
                                                var obj = new Ext.data.Record(config.app_multientity);
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.clientCombo.getStore().add(obj);
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.clientCombo.setRawValue(config.app_multientity.name);
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.clientCombo.clearInvalid();
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.clientCombo.fireEvent('select', window['ContractApp'].formPanel.tabPanel.generalPanel.clientCombo, obj);
                                                window['ContractApp'].clientRecord = config.app_multientity;
                                                
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.reset();
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.reset();
                                                
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.reset();
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.getStore().baseParams.entityid = record.get('id');
                                                window['PersonApp'].window.entityid = record.get('id');
                                                
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.reset();
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.getStore().baseParams.entityid = config.app_multientity.id;
                                            }
                                            
                                            if(combo.getRawValue() == '')
                                                window['ContractApp'].providerRecord = false;
                                            else {
                                                if(record && record.get('name') == combo.getRawValue())
                                                    window['ContractApp'].providerRecord = record.data;
                                                else {
                                                    window['ContractApp'].providerRecord = false;
                                                    field.markInvalid(bundle.getMsg('app.error.fieldinvalid'));
                                                }
                                            }
                                            window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.setDisabled(window['ContractApp'].providerRecord == false);
                                            if(window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.disabled){
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.reset();
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.reset();
                                                window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.reset();
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
                                })]
                            },{
                                columnWidth:.35,
                                layout: 'form',
                                items: [new Ext.form.ClearableCombo({
                                    ref: '../../provideruserCombo',
                                    fieldLabel: bundle.getMsg('contract.field.user.provider')+'<span style="color:red;"><sup>*</sup></span>',
                                    anchor: '-20',
                                    disabled: true,
                                    store: new Ext.data.Store({
                                        url: config.app_host + '/user/request/method/load',
                                        baseParams:{
                                            entityid: config.app_entityid,
                                            filter: '[{"type":"string","value":"legalrepresentant__true","field":"profile"}]',
                                            component: 'combo'
                                        },
                                        reader: new Ext.data.JsonReader(),
                                        listeners: {
                                            load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                                                alertNoRecords(records, bundle.getMsg('user.tab.label').toLowerCase());
                                            },
                                            loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                                        }
                                    }),
                                    valueField: 'id', 
                                    displayField: 'full_name',
                                    typeAhead: true,
                                    forceSelection: true,
                                    mode: 'local',
                                    triggerAction: 'all',
                                    selectOnFocus:true,
                                    emptyText: bundle.getMsg('app.form.select'),
                                    allowBlank: false,
                                    triggerConfig: {
                                        tag:'span', 
                                        cls:'x-form-twin-triggers', 
                                        style:'padding-right:2px',
                                        cn:[{
                                            tag: "img", 
                                            src: Ext.BLANK_IMAGE_URL, 
                                            cls: "x-form-trigger"
                                        },{
                                            tag: "img", 
                                            src: Ext.BLANK_IMAGE_URL, 
                                            cls: "x-form-trigger x-form-plus-trigger"
                                        }]
                                    },
                                    listeners: {
                                        focus: function(combo) {
                                            if(!combo.readOnly && !combo.disabled)
                                                combo.getStore().load();
                                        }
                                    },
                                    onTrigger2Click: function(){ 
                                        if(!window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.disabled){
                                            var obj = new Object;
                                            obj.params = [window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo];
                                            obj.entityid = window['ContractApp'].providerRecord.id;
                                            obj.fn = function(params){
                                                var cmp = params[0];
                                                var obj = params[1];
                                                var mask = new Ext.LoadMask(window['PersonApp'].window.getEl(), {
                                                    msg: bundle.getMsg('app.layout.loading')+'...'
                                                });
                                                mask.show();
                                                cmp.store.load({
                                                    callback: function(records, options, success){
                                                        var record = cmp.getStore().getAt(cmp.getStore().find('id',obj.data.id, 0, true, true));								 
                                                        if(record)
                                                            cmp.setValue(obj.data.id);
                                                        mask.hide();
                                                    }
                                                });
                                            };
                                            window['PersonApp'].gridPanel.getSelectionModel().clearSelections();
                                            window['PersonApp'].showWindow(window['PersonApp'].window.getEl(), true, obj);
                                        }	
                                    }
                                })]
                            }]
                        }, {
                            layout:'column',
                            border: false,
                            defaults:{
                                border:false
                            }, 	
                            items:[{
                                columnWidth:.79,
                                layout: 'form',
                                items: [{
                                    xtype:'textarea',
                                    name: 'comment',
                                    fieldLabel: bundle.getMsg('contract.field.comment')+'<span style="color:red;"><sup>*</sup></span>',      
                                    allowBlank: false,    
                                    height: 71,
                                    anchor:'-20'
                                }]
                            },{
                                columnWidth:.21,
                                layout: 'form',
                                items: [{
                                    xtype: 'datefield',
                                    fieldLabel: bundle.getMsg('contract.field.startdate'),
                                    name: 'startdate',
                                    id: 'contractstartDateField',
                                    vtype: 'daterange',
                                    endDateField: 'contractendDateField',
                                    anchor:'-20',
                                    listeners: {
                                        select:function(field) {
                                            Ext.getCmp(field.endDateField).setDisabled(field.getValue()=='');
                                        },
                                        change: function(field, newValue) {
                                            Ext.getCmp(field.endDateField).setDisabled(!newValue || newValue=='');
                                            if(!newValue || newValue == ''){
                                                Ext.getCmp(field.endDateField).setMaxValue(false);
                                                Ext.getCmp(field.endDateField).setMinValue(false);
                                                Ext.getCmp(field.endDateField).reset();
                                            }
                                        }
                                    }
                                },{
                                    ref: '../../endDateField',
                                    xtype: 'datefield',
                                    fieldLabel: bundle.getMsg('contract.field.enddate'),
                                    name: 'enddate',
                                    id: 'contractendDateField',
                                    vtype: 'daterange',
                                    disabled: true,
                                    startDateField: 'contractstartDateField',
                                    anchor:'-20',
                                    listeners: {
                                        change: function(field, newValue) {
                                            if(!newValue || newValue == ''){
                                                Ext.getCmp(field.startDateField).setMaxValue(false);
                                                Ext.getCmp(field.startDateField).setMinValue(false);
                                            }
                                        }
                                    }
                                }]
                            }]
                        },{
                            layout:'column',
                            border: false,
                            defaults:{
                                border:false
                            }, 	
                            items:[{
                                columnWidth:1,
                                layout: 'form',
                                items: [new Ext.form.ClearableCombo({
                                    ref: '../../paymentwayCombo',
                                    fieldLabel: bundle.getMsg('contract.field.payment.way')+'<span style="color:red;"><sup>*</sup></span>',
                                    anchor: '-20',
                                    disabled: true,
                                    store: new Ext.data.Store({
                                        reader: new Ext.data.JsonReader()
                                    }),
                                    valueField: 'id', 
                                    displayField: 'name',
                                    typeAhead: true,
                                    forceSelection: true,
                                    mode: 'local',
                                    triggerAction: 'all',
                                    selectOnFocus:true,
                                    emptyText: bundle.getMsg('app.form.select'),
                                    allowBlank: false,
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
                        },{
                            layout:'column',
                            border: false,
                            defaults:{
                                border:false
                            }, 	
                            items:[{
                                columnWidth:1,
                                layout: 'form',
                                items: [new Ext.form.ClearableCombo({
                                    ref: '../../paymentplaceCombo',
                                    fieldLabel: bundle.getMsg('contract.field.payment.place')+'<span style="color:red;"><sup>*</sup></span>',
                                    anchor: '-20',
                                    disabled: true,
                                    store: new Ext.data.Store({
                                        reader: new Ext.data.JsonReader()
                                    }),
                                    tpl: '<tpl for="."><div ext:qtip="{name}" class="x-combo-list-item">{name}</div></tpl>',
                                    valueField: 'id', 
                                    displayField: 'name',
                                    typeAhead: true,
                                    forceSelection: true,
                                    mode: 'local',
                                    triggerAction: 'all',
                                    selectOnFocus:true,
                                    emptyText: bundle.getMsg('app.form.select'),
                                    allowBlank: false,
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
                        }]
                    }, new Ext.grid.GridPanel({
                        ref: 'paymentinstrumentPanel',
                        stripeRows: true,
                        autoExpandColumn: 'contractpaymentinstrumentmaincolumn',
                        title: bundle.getMsg('contract.tab.paymentinstrument'),
                        iconCls: Ext.ux.Icon('medal_gold_1'),
                        store: new Ext.data.Store({
                            reader: new Ext.data.JsonReader()
                        }),
                        sm: new Ext.grid.RowSelectionModel({
                            singleSelect:true, 
                            listeners: {
                                selectionchange: function(selectionModel) {
                                    window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.removeBtn.setDisabled(selectionModel.getCount() < 1);
                                }
                            }
                        }),	
                        view: new Ext.grid.GridView({
                            markDirty: false,
                            forceFit:true
                        }),
                        columns: [new Ext.grid.RowNumberer(),{
                            id:'contractpaymentinstrumentmaincolumn', 
                            header: bundle.getMsg('paymentinstrument.field.label'),
                            width: 130, 
                            sortable: true, 
                            dataIndex: 'name'
                        },{
                            header: bundle.getMsg('contract.field.downpayment'),
                            width: 30, 
                            sortable: true,
                            dataIndex: 'downpayment', 
                            align: 'center',
                            renderer: function(val) {
                                if(val == 1)
                                    return '<img src="'+config.app_host + '/images/icons/famfamfam/tick.png" height="12"/>';
                                return '';
                            }
                        }],
                        tbar: [new Ext.Toolbar.TextItem(bundle.getMsg('paymentinstrument.field.label')+'<span style="color:red;"><sup>*</sup></span>: '), new Ext.form.ClearableCombo({
                            ref: 'paymentinstrumentCombo',
                            fieldLabel: bundle.getMsg('paymentinstrument.field.label')+'<span style="color:red;"><sup>*</sup></span>',
                            width: 270,
                            store: window['PaymentinstrumentApp'].comboStore,
                            valueField: 'id', 
                            displayField: 'name',
                            tpl: '<tpl for="."><div ext:qtip="{name}:{comment}" class="x-combo-list-item">{name}</div></tpl>',
                            typeAhead: true,
                            forceSelection: true,
                            mode: 'local',
                            triggerAction: 'all',
                            selectOnFocus:true,
                            emptyText: bundle.getMsg('app.form.select'),
                            allowBlank: false,
                            triggerConfig: {
                                tag:'span', 
                                cls:'x-form-twin-triggers', 
                                style:'padding-right:2px',
                                cn:[{
                                    tag: "img", 
                                    src: Ext.BLANK_IMAGE_URL, 
                                    cls: "x-form-trigger"
                                },{
                                    tag: "img", 
                                    src: Ext.BLANK_IMAGE_URL, 
                                    cls: "x-form-trigger x-form-plus-trigger"
                                }]
                            },
                            listeners: {
                                focus: function(combo) {
                                    if(!combo.readOnly && !combo.disabled)
                                        combo.getStore().load();
                                },
                                select: function(combo, record, index ){
                                    window['ContractApp'].paymentinstrumentRecord = record;
                                    this.collapse();
                                },
                                blur: function(field) {		
                                    if(field.getRawValue() == '')
                                        window['ContractApp'].paymentinstrumentRecord = false;
                                    else {
                                        var record = field.getStore().getAt(field.getStore().find('name',field.getRawValue(), 0, true, true));								 
                                        if(record && record.get('name') == field.getRawValue())
                                            window['ContractApp'].paymentinstrumentRecord = record;
                                        else {
                                            window['ContractApp'].paymentinstrumentRecord = false;
                                            field.markInvalid(bundle.getMsg('app.error.fieldinvalid'));
                                        }
                                    }
                                }
                            },
                            onTrigger2Click: function(){ 
                                var obj = new Object;
                                obj.params = [window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.topToolbar.paymentinstrumentCombo];
                                obj.fn = function(params){
                                    var cmp = params[0];
                                    var obj = params[1];
                                    var mask = new Ext.LoadMask(window['PaymentinstrumentApp'].window.getEl(), {
                                        msg: bundle.getMsg('app.layout.loading')+'...'
                                    });
                                    mask.show();
                                    cmp.store.load({
                                        callback: function(records, options, success){
                                            var record = cmp.getStore().getAt(cmp.getStore().find('id',obj.data.id, 0, true, true));								 
                                            if(record){
                                                cmp.setValue(obj.data.id);
                                                window['ContractApp'].paymentinstrumentRecord = record;
                                            }
                                            mask.hide();
                                        }
                                    });
                                };
                                window['PaymentinstrumentApp'].gridPanel.getSelectionModel().clearSelections();
                                window['PaymentinstrumentApp'].showWindow(window['PaymentinstrumentApp'].window.getEl(), true, obj);
                            }
                        }), '->',{
                            tooltip: bundle.getMsg('app.form.addrow'),
                            iconCls: Ext.ux.Icon('table_row_insert'),
                            listeners: {
                                click: function(button, eventObject) { 
                                    if(window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.topToolbar.paymentinstrumentCombo.isValid()){
                                        window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.store.insert(window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.store.getCount(), window['ContractApp'].paymentinstrumentRecord);
                                        window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.reconfigure(window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.getStore(), window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.getColumnModel());
                                          
                                        window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.topToolbar.paymentinstrumentCombo.reset(); 
                                        window['ContractApp'].paymentinstrumentRecord = false;
                                          
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
                                    var records = window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.getSelectionModel().getSelections();
                                    window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.store.remove(records);
                                }
                            }
                        }],
                        listeners: {
                            activate: function() {
                                if(permissions.indexOf('managepaymentinstrument') == -1 && permissions.indexOf('managepaymentinstrumentadd') == -1)
                                    window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.topToolbar.paymentinstrumentCombo.getTrigger(1).hide();
                                
                                window['ContractApp'].disposeWindowsButtons();
                            },
                            rowdblclick : function(grid, rowIndex){
                                var records = grid.getSelectionModel().getSelections();
                                grid.getStore().remove(records);
                                for(var i = 0; i < records.length; i++){
                                    records[i].set('downpayment', !records[i].get('downpayment'));
                                    grid.getStore().insert(rowIndex, records[i]);
                                }
                            }
                        }
                    }), {
                        ref: 'suplementsPanel',
                        title: bundle.getMsg('suplement.tab.label'),	
                        iconCls: Ext.ux.Icon('page_attach'),
                        border:false,
                        disabled: true,
                        layout: 'border',
                        items: [this.suplementsPanel],
                        listeners: {
                            activate: function() {
                                window['ContractApp'].suplementsPanel.contentEditor.dateField.setDisabled(false);
                                window['ContractApp'].disposeWindowsButtons();
                            },
                            deactivate: function() { 
                                window['ContractApp'].suplementsPanel.contentEditor.dateField.setDisabled(true);                                
                                window['ContractApp'].suplementsPanel.getLayout().setActiveItem(0);  
                                window['ContractApp'].suplementsPanel.doLayout();
                            }
                        }
                    }, {
                        ref: 'reclamationsPanel',
                        title: bundle.getMsg('reclamation.tab.label'),	
                        iconCls: Ext.ux.Icon('comment'),
                        border:false,
                        disabled: true,
                        layout: 'border',
                        items: [this.reclamationsPanel],
                        listeners: {
                            activate: function() {
                                window['ContractApp'].reclamationsPanel.contentEditor.reclamationtypeCombo.setDisabled(false);
                                window['ContractApp'].reclamationsPanel.contentEditor.dateField.setDisabled(false);
                                window['ContractApp'].reclamationsPanel.contentEditor.numberField.setDisabled(false);
                                
                                window['ContractApp'].disposeWindowsButtons();
                            },
                            deactivate: function() { 
                                window['ContractApp'].reclamationsPanel.contentEditor.reclamationtypeCombo.setDisabled(true);
                                window['ContractApp'].reclamationsPanel.contentEditor.dateField.setDisabled(true);
                                window['ContractApp'].reclamationsPanel.contentEditor.numberField.setDisabled(true);
                                
                                window['ContractApp'].reclamationsPanel.getLayout().setActiveItem(0);  
                                window['ContractApp'].reclamationsPanel.doLayout();
                            }
                        }
                    },{
                        ref: 'filesPanel',
                        title: bundle.getMsg("contract.tab.files"),
                        iconCls: Ext.ux.Icon('page_white_copy'),
                        border:false,
                        disabled: true,
                        layout: 'border',
                        items: [this.filesPanel],
                        listeners: {
                            activate: function() {
                                window['ContractApp'].disposeWindowsButtons();
                            }
                        }
                    },{
                        ref: 'notesPanel',
                        title: bundle.getMsg('contract.tab.notes'),	
                        iconCls: Ext.ux.Icon('note'),
                        border:false,
                        disabled: true,
                        layout: 'border',
                        items: [this.notesPanel],
                        listeners: {
                            activate: function() {
                                window['ContractApp'].disposeWindowsButtons();
                            },
                            deactivate: function() { 
                                window['ContractApp'].notesPanel.getLayout().setActiveItem(0);  
                                window['ContractApp'].notesPanel.doLayout();
                            }
                        }
                    }]
                })]
            });
            
        },
        
        renderContract : function(data, callback){
            data.generaldata = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+bundle.getMsg('piece.action.nodatatodisplay');
            if(data.comment && data.comment!='')
                data.generaldata = data.comment;
            if(callback){
                callback(data.generaldata);
            }
                
            return data;
        },
        
        populatePaymentWaysCombo : function(record, id){
            
            var showmessage = false;
            if(record.data && record.data.profile && record.data.profile!=''){
                var profile = Ext.decode(record.data.profile);
                if(!profile.paymentways || profile.paymentways.length<1)
                    showmessage = true;
                
                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.store.removeAll();
                for(var i = 0; profile.paymentways && i < profile.paymentways.length; i++){
                    var r = new Ext.data.Record(profile.paymentways[i]);
                    r.set('id', i+1);
                    r.id = i+1;
                    window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.store.add(r);
                }
                
                if(id && id!='')
                    window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.setValue(id);
            }
            else
                showmessage = true;
            
            if(showmessage)
                Ext.Base.msg('', bundle.getMsg('entity.action.load.paymentway.norecords')); 
            
            window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.setDisabled(showmessage);
            
        },
        populatePaymentPlacesCombo : function(record, id){
            var showmessage = false;
            if(record.data && record.data.profile && record.data.profile!=''){
                var profile = Ext.decode(record.data.profile);
                if(!profile.paymentplaces || profile.paymentplaces.length<1)
                    showmessage = true;
                
                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.store.removeAll();
                for(var i = 0; profile.paymentplaces && i < profile.paymentplaces.length; i++){
                    var r = new Ext.data.Record(profile.paymentplaces[i]);
                    r.set('id', i+1);
                    r.id = i+1;
                    window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.store.add(r);
                }
                
                if(id && id!='')
                    window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.setValue(id);
            }
            else
                showmessage = true;
            
            if(showmessage)
                Ext.Base.msg('', bundle.getMsg('entity.action.load.paymentplace.norecords')); 
            
            window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.setDisabled(showmessage);
            
        },
        
        disposeWindowsButtons : function(){
            if(window['ContractApp'].window){
                var visible = window['ContractApp'].formPanel.tabPanel.getActiveTab().ref == 'paymentinstrumentPanel' ||
                window['ContractApp'].formPanel.tabPanel.getActiveTab().ref == 'generalPanel';
            
                window['ContractApp'].window.submitBtn.setVisible(visible);
                window['ContractApp'].window.applyBtn.setVisible(visible);  
                if(!visible)
                    window['ContractApp'].window.cancelBtn.setText(bundle.getMsg('app.languaje.close.label'));
                else
                    window['ContractApp'].window.cancelBtn.setText(bundle.getMsg('app.form.cancel'));  
            }
            
        },
        
        showWindow : function(animateTarget, hideApply, callback){
            var resetFn = function(){				
                window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.reset();
                window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.setDisabled(true);
                
                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.store.removeAll();
                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.reset();
                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.setDisabled(true);
                
                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.store.removeAll();
                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.reset();
                window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.setDisabled(true);
                
                window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.reset();
                window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.setDisabled(true);
                
                window['ContractApp'].formPanel.tabPanel.generalPanel.endDateField.reset();
                window['ContractApp'].formPanel.tabPanel.generalPanel.endDateField.setDisabled(true);
                
                window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.store.removeAll();
            };
            
            window['ContractApp'].window = App.showWindow(bundle.getMsg('contract.window.title'), 890, 480, window['ContractApp'].formPanel, 
                function(button){
                    if(!button){
                        button = new Object;
                        button.id = window['ContractApp'].window.submitBtn.id;
                    }
                
                    var records = window['ContractApp'].gridPanel.getSelectionModel().getSelections();
                    
                    var paymentinstruments = new Array();
                    window['ContractApp'].formPanel.tabPanel.paymentinstrumentPanel.store.each(function(record){
                        paymentinstruments.push(record.data);
                    });
                    
                    
                    window['ContractApp'].formPanel.getForm().submit({
                        waitTitle : bundle.getMsg('app.msg.wait.title'), 
                        waitMsg: bundle.getMsg('app.msg.wait.text'), 
                        clientValidation: true,
                        params: {
                            id: records[0] ? records[0].get('id'):'',
                            providerid: window['ContractApp'].providerRecord ? window['ContractApp'].providerRecord.id : '',
                            clientid: window['ContractApp'].clientRecord ? window['ContractApp'].clientRecord.id : '',
                            clientuserid: window['ContractApp'].formPanel.tabPanel.generalPanel.clientuserCombo.getValue(),
                            contracttypeid: window['ContractApp'].formPanel.tabPanel.generalPanel.contracttypeCombo.getValue(),
                            provideruserid: window['ContractApp'].formPanel.tabPanel.generalPanel.provideruserCombo.getValue(),
                            areaid: window['ContractApp'].formPanel.tabPanel.generalPanel.areaCombo.getValue(),
                            contractstatusid: window['ContractApp'].formPanel.tabPanel.generalPanel.contractstatusCombo.getValue(),
                            paymentwayid: window['ContractApp'].formPanel.tabPanel.generalPanel.paymentwayCombo.getValue(),
                            paymentplaceid: window['ContractApp'].formPanel.tabPanel.generalPanel.paymentplaceCombo.getValue(),
                            paymentinstruments: Ext.encode(paymentinstruments),
                            entityid: config.app_entityid
                        },
                        success: function(form, action) {
                            checkSesionExpired(form, action);
                            window['ContractApp'].store.load({
                                params:{
                                    start: window['ContractApp'].gridPanel.getBottomToolbar().cursor
                                }
                            });
                            
                            submitFormSuccessful('ContractApp', form, action, button, !records[0], resetFn, callback);
                        },
                        failure: loadFormFailed
                    });
                
                }, 
                function(){
                    resetFn();
                    window['ContractApp'].formPanel.getForm().reset();
                    window['ContractApp'].window.hide();
                }, 
                animateTarget,
                false,
                false,
                false,
                hideApply ? hideApply : false);
        },
        
        applySecurity : function(groups, permissions){
            window['ContractApp'].gridPanel.addBtn.setVisible(permissions.indexOf('managecontract') != -1 || permissions.indexOf('managecontractadd') != -1);
            window['ContractApp'].gridPanel.updateBtn.setVisible(permissions.indexOf('managecontract') != -1 || permissions.indexOf('managecontractedit') != -1);
            window['ContractApp'].gridPanel.removeBtn.setVisible(permissions.indexOf('managecontract') != -1 || permissions.indexOf('managecontractdelete') != -1);            
        }
    }
}();

