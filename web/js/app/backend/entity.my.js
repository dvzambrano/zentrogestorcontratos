/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage entity
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */

EntityApp = function() {
    return {
        init : function(EntityApp) {
			
            this.store = new Ext.data.GroupingStore({
                url: config.app_host + '/entity/request/method/load',
                baseParams:{
                    component: 'grid',
                    start: 0,
                    limit: config.app_elementsongrid
                },
                groupField: 'Entitytype',
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('entity.tab.label').toLowerCase());                      
                    }
                }
            });
            
            this.comboStore = new Ext.data.Store({
                url: config.app_host + '/entity/request/method/load',
                baseParams:{
                    component: 'combo'
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('entity.tab.label').toLowerCase());
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
                    dataIndex: 'specialcode'
                },{
                    type: 'string',
                    dataIndex: 'name'
                },{
                    type: 'string',
                    dataIndex: 'shortname'
                },{
                    type: 'string',
                    dataIndex: 'address'
                }]
            });
            
            this.infoTextItem = new Ext.Toolbar.TextItem('');
			
            this.gridPanel = new Ext.grid.GridPanel({
                id: 'gridPanelEntity',
                region:'center',
                layout: 'fit', 
                iconCls: Ext.ux.Icon('tag_orange'),
                title: config.app_showgridtitle ? bundle.getMsg("entity.grid.title") : '',
                autoExpandColumn: 'entitycolname',
                store: this.store,
                loadMask: true,
                tools: [{
                    id:'print',
                    qtip: bundle.getMsg('app.languaje.report.printview'),
                    handler: function() {
                        App.printView(window['EntityApp'].gridPanel);
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
                        var text = App.getFiltersText(window['EntityApp'].gridPanel);
                        if(text && text!=''){
                            Ext.fly(window['EntityApp'].infoTextItem.getEl()).update(String.format(bundle.getMsg('app.form.filteringby'), text));
                            window['EntityApp'].infoTextItem.getEl().highlight('#FFFF66', {
                                block:true
                            });
                        }
                        else
                            Ext.fly(window['EntityApp'].infoTextItem.getEl()).update('');
                    }
                },
				
                columns: [new Ext.grid.RowNumberer(),{
                    header: bundle.getMsg('entity.field.specialcode'), 
                    width: 60, 
                    sortable: true, 
                    dataIndex: 'specialcode'
                },{
                    header: bundle.getMsg('entity.field.name.jp'), 
                    width: 200, 
                    sortable: true, 
                    dataIndex: 'name'
                },{
                    header: bundle.getMsg('entity.field.shortname'), 
                    width: 90, 
                    sortable: true, 
                    dataIndex: 'shortname'
                },{
                    id:'entitycolname', 
                    header: bundle.getMsg('app.form.address'), 
                    width: 360, 
                    sortable: true, 
                    dataIndex: 'address'
                },{
                    header: bundle.getMsg('entitytype.field.label'), 
                    width: 40, 
                    sortable: true, 
                    hidden: true, 
                    dataIndex: 'Entitytype',
                    renderer: function(value) {
                        if(value)
                            return value.name;
                        return '';
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
                            window['EntityApp'].gridPanel.getSelectionModel().clearSelections();
                            window['EntityApp'].gridPanel.updateBtn.fireEvent('click', button, eventObject, hideApply, callback);
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
                            
                            var finalFn = function(){
                                window['EntityApp'].switchForm(false);
                                var record = window['EntityApp'].gridPanel.getSelectionModel().getSelected();
                                if (record){
                                    window['EntityApp'].formPanel.getForm().loadRecord(record);
                                    
                                    if (record.get('logo')&&record.get('logo')!='')
                                        try{
                                            Ext.getDom('logo').src = record.get('logo');
                                        }catch(e){ }
                                    
                                    if(record.get('images') && record.get('images')!='')
                                        App.addFiles(Ext.decode(record.get('images')), window['EntityApp'].imagesPanel);
                                    
                                    if(record.get('entitytypeid') && record.get('entitytypeid')!='')
                                        window['EntityApp'].formPanel.tabPanel.generalPanel.entitytypeCombo.setValue(record.get('entitytypeid'));
                                    
                                    var entitytype = window['EntityApp'].formPanel.tabPanel.generalPanel.entitytypeCombo.getStore().getAt(window['EntityApp'].formPanel.tabPanel.generalPanel.entitytypeCombo.getStore().find('name', record.get('Entitytype').name, 0, true, true));
                                    window['EntityApp'].switchForm(entitytype);
                                    
                                    if(record.get('nationalityid') && record.get('nationalityid')!='')
                                        window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.locationPanel.nationalityCombo.setValue(record.get('nationalityid'));
                                    
                                    window['EntityApp'].organismRecord = new Ext.data.Record(record.get('Entity'));
                                    window['EntityApp'].organismRecord.id = window['EntityApp'].organismRecord.data.id;
                                    window['EntityApp'].formPanel.tabPanel.generalPanel.organismCombo.setRawValue(window['EntityApp'].organismRecord.data.name);
                                    
                                    window['EntityApp'].locationRecord = new Ext.data.Record(record.get('Location'));
                                    window['EntityApp'].locationRecord.id = window['EntityApp'].locationRecord.data.id;
                                    window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.locationPanel.locationCombo.setRawValue(window['EntityApp'].locationRecord.data.name);
                                    
                                    var i = 0;
                                    window['EntityApp'].activityPanel.getStore().removeAll();
                                    window['EntityApp'].contactPanel.getStore().removeAll();
                                    window['EntityApp'].formPanel.tabPanel.accountPanel.store.removeAll();                                
                                    if(record.get('profile') && record.get('profile')!=''){
                                        var profile = Ext.decode(record.get('profile'));
                                        if(profile){
                                            for (i = 0; profile.activities && i < profile.activities.length; i++)
                                                window['EntityApp'].activityPanel.getStore().insert(window['EntityApp'].activityPanel.getStore().getCount(), new Ext.data.Record(profile.activities[i]));
                                            window['EntityApp'].activityPanel.reconfigure(window['EntityApp'].activityPanel.getStore(), window['EntityApp'].activityPanel.getColumnModel());
                                        
                                            for (i = 0; profile.contacts && i < profile.contacts.length; i++)
                                                window['EntityApp'].contactPanel.getStore().insert(window['EntityApp'].contactPanel.getStore().getCount(), new Ext.data.Record(profile.contacts[i]));
                                            window['EntityApp'].contactPanel.reconfigure(window['EntityApp'].contactPanel.getStore(), window['EntityApp'].contactPanel.getColumnModel());
                                        
                                            for (i = 0; profile.accounts && i < profile.accounts.length; i++)
                                                window['EntityApp'].formPanel.tabPanel.accountPanel.store.insert(window['EntityApp'].formPanel.tabPanel.accountPanel.store.getCount(), new Ext.data.Record(profile.accounts[i]));
                                            window['EntityApp'].formPanel.tabPanel.accountPanel.reconfigure(window['EntityApp'].formPanel.tabPanel.accountPanel.getStore(), window['EntityApp'].formPanel.tabPanel.accountPanel.getColumnModel());
                                        
                                            for (i = 0; profile.paymentways && i < profile.paymentways.length; i++)
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.store.insert(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.store.getCount(), new Ext.data.Record(profile.paymentways[i]));
                                            window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.reconfigure(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.getStore(), window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.getColumnModel());
                                        
                                            for (i = 0; profile.paymentplaces && i < profile.paymentplaces.length; i++)
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.store.insert(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.store.getCount(), new Ext.data.Record(profile.paymentplaces[i]));
                                            window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.reconfigure(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.getStore(), window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.getColumnModel());
                                        
                                            if(profile.metadatas){
                                                var metadata = profile.metadatas;
                                                
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documenttypeCombo.setValue(metadata.document.type);
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documentnumberTextField.setValue(metadata.document.number);
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documentdateDateField.setValue(metadata.document.date);
                                                
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeuptomoTextField.setValue(metadata.reeup.tomo);
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeupfolioTextField.setValue(metadata.reeup.folio);
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeuppageTextField.setValue(metadata.reeup.page);
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeupdateDateField.setValue(metadata.reeup.date);
                                                
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.cucnumberTextField.setValue(metadata.cuc.tomo);
                                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.cucdateDateField.setValue(metadata.cuc.date);
                                            }
                                        }
                                    }
                                }
                                else
                                    window['EntityApp'].formPanel.getForm().reset();
                                    
                                window['EntityApp'].showWindow(button.getEl(), hideApply, callback);
                                App.mask.hide();
                            };
                            
                            syncLoad([
                                window['EntityApp'].formPanel.tabPanel.generalPanel.entitytypeCombo.getStore(),
                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documenttypeCombo.store,
                                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.locationPanel.nationalityCombo.store
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
                                            var records = window['EntityApp'].gridPanel.getSelectionModel().getSelections();
											
                                            var array = new Array();                                
                                            for (var i=0; i<records.length; i++)
                                                array.push(records[i].get('id'));
											
                                            App.mask.show();
												
                                            new Ext.data.Connection().request({
                                                url: config.app_host + '/entity/request/method/delete',
                                                params: {
                                                    ids: Ext.encode(array)
                                                },
                                                failure: requestFailed,
                                                success: requestSuccessful,
                                                callback : function(options, success, response) {
                                                    App.mask.hide();
                                                    var object = Ext.decode(response.responseText);
                                                    if(object.success){
                                                        window['EntityApp'].store.load({
                                                            params:{
                                                                start: window['EntityApp'].gridPanel.getBottomToolbar().cursor
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
                },'->',{
                    ref: '../importBtn',
                    text: bundle.getMsg('entity.import.label'),
                    iconCls: Ext.ux.Icon('database_go'),
                    menu: {
                        items: [{
                            text: bundle.getMsg('entity.import.entitystandardexcel'),
                            ref: '../importBtn',
                            listeners: {
                                click: function(button, eventObject, hideApply, callback) {
                                    window['EntityApp'].showImportForm(false, 'web/uploads/import/entity', function(url){
                                        var msg=App.mask.msg;
                                        App.mask.msg=bundle.getMsg('app.layout.loading');
                                        App.mask.show();
                                        
                                        window['ExplorerApp'].readFile({
                                            id:'web/' + url
                                        }, '', function(content){
                                            var files = content[0];
                                            files.shift();
                                            var total = files.length;
                                            var count = 0;

                                            App.mask.hide();
                                            App.mask.msg = msg;

                                            var processFile = function(files, nextFn) {
                                                var start = (files.length-total)*-1;
                                                if(files && files.length>0){
                                                    var currentfile = Ext.util.Format.ellipsis(files[0][1], 30);

                                                    Ext.MessageBox.progress(bundle.getMsg('app.msg.wait.title'), String.format(bundle.getMsg('entity.import.description'), start+1, total) + '...');
                                                    Ext.MessageBox.updateProgress(start/total, currentfile);

                                                    new Ext.data.Connection().request({
                                                        url: config.app_host + '/entity/request/method/import',
                                                        method: 'POST',
                                                        params: { 
                                                            code: files[0][8]+'-'+files[0][13]+'-'+files[0][0],
                                                            name: files[0][1],
                                                            shortname: files[0][2],
                                                            address: files[0][3],
                                                            dpa: files[0][5],
                                                            type: files[0][11],
                                                            sub: files[0][8]
                                                        },
                                                        callback : function(options, success, response) {
                                                            var object = Ext.decode(response.responseText);
                                                            if(object.success)
                                                                count++;
                                                            files.splice(0,1);
                                                            nextFn(files, processFile);
                                                        }
                                                    });
                                                }
                                                else{
                                                    Ext.MessageBox.hide(); 
                                                    Ext.Msg.show({
                                                        title:bundle.getMsg('app.msg.info.title'),
                                                        msg: String.format(bundle.getMsg('entity.import.done'), count),
                                                        buttons: Ext.Msg.OK,
                                                        icon: Ext.MessageBox.INFO
                                                    });
                                                    window['EntityApp'].store.load({
                                                        params:{
                                                            start: window['EntityApp'].gridPanel.getBottomToolbar().cursor
                                                        }
                                                    });
                                                }
                                            };

                                            processFile(files, processFile);
                                                
                                        }, true, 'array');
                                    });
                                }
                            }
                        },{
                            text: bundle.getMsg('entity.import.organismstandardexcel'),
                            listeners: {
                                click: function(button, eventObject, hideApply, callback) {
                                    window['EntityApp'].showImportForm(false, 'web/uploads/import/organism', function(url){
                                        var msg=App.mask.msg;
                                        App.mask.msg=bundle.getMsg('app.layout.loading');
                                        App.mask.show();
                                        
                                        window['ExplorerApp'].readFile({
                                            id:'web/' + url
                                        }, '', function(content){
                                            var files = content[0];
                                            files.shift();
                                            var total = files.length;
                                            var count = 0;

                                            App.mask.hide();
                                            App.mask.msg = msg;

                                            var processFile = function(files, nextFn) {
                                                var start = (files.length-total)*-1;
                                                if(files && files.length>0){
                                                    var currentfile = Ext.util.Format.ellipsis(files[0][1], 30);

                                                    Ext.MessageBox.progress(bundle.getMsg('app.msg.wait.title'), String.format(bundle.getMsg('entity.import.description'), start+1, total) + '...');
                                                    Ext.MessageBox.updateProgress(start/total, currentfile);

                                                    new Ext.data.Connection().request({
                                                        url: config.app_host + '/entity/request/method/organize',
                                                        method: 'POST',
                                                        params: { 
                                                            code: files[0][0],
                                                            name: files[0][1],
                                                            shortname: files[0][2]
                                                        },
                                                        callback : function(options, success, response) {
                                                            var object = Ext.decode(response.responseText);
                                                            if(object.success)
                                                                count++;
                                                            files.splice(0,1);
                                                            nextFn(files, processFile);
                                                        }
                                                    });
                                                }
                                                else{
                                                    Ext.MessageBox.hide(); 
                                                    Ext.Msg.show({
                                                        title:bundle.getMsg('app.msg.info.title'),
                                                        msg: String.format(bundle.getMsg('entity.import.done'), count),
                                                        buttons: Ext.Msg.OK,
                                                        icon: Ext.MessageBox.INFO
                                                    });
                                                    window['EntityApp'].store.load({
                                                        params:{
                                                            start: window['EntityApp'].gridPanel.getBottomToolbar().cursor
                                                        }
                                                    });
                                                }
                                            };

                                            processFile(files, processFile);
                                                
                                        }, true, 'array');
                                    });
                                }
                            }
                        }]
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
                            window['EntityApp'].gridPanel.filters.clearFilters();
                            Ext.fly(window['EntityApp'].infoTextItem.getEl()).update('');
                            window['EntityApp'].gridPanel.getSelectionModel().clearSelections();
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
            
            this.imagesPanel = App.getFilesPanelFor('entity',  Date.patterns.OnlyImagesAllowed, 'images');
            
            this.contactPanel = window['ContacttypeApp'].getPanelFor('entity');
            this.activityPanel = window['ActivityApp'].getPanelFor('entity');
            
            this.expander = new Ext.ux.grid.RowExpander({
                enableCaching : false,
                tpl : new Ext.Template('\
                    <div style="width:100%;" class="x-grid3-row x-grid3-row-alt x-grid3-row-collapsed x-grid3-row-last">\
                       <table border="0" cellspacing="5" cellpadding="5" style="width:100%;" class="x-grid3-row-table">\
                          <tbody>{answer}</tbody>\
                       </table>\
                    </div>')
            });
            
            this.formPanel = new Ext.FormPanel({
                labelWidth: 75,
                labelAlign: 'top',
                url: config.app_host + '/entity/request/method/save',
                keys: [formKeyMaping],	
                border:false,
                items: [new Ext.TabPanel({
                    ref: 'tabPanel',
                    deferredRender: false,
                    height: 410,
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
                        listeners: {
                            activate: function(panel) {
                                if(permissions.indexOf('manageentitytype') == -1 && permissions.indexOf('manageentitytypeadd') == -1 && window['EntityApp'].formPanel.tabPanel.generalPanel.entitytypeCombo.getTrigger(1).hide)
                                    window['EntityApp'].formPanel.tabPanel.generalPanel.entitytypeCombo.getTrigger(1).hide();
                            }
                        },
                        items: [{
                            layout:'column',
                            border: false,
                            defaults:{
                                border:false
                            }, 	
                            items:[{
                                columnWidth:.85,
                                layout: 'form',
                                items: [{
                                    layout:'column',
                                    border: false,
                                    defaults:{
                                        border:false
                                    }, 	
                                    items:[{
                                        columnWidth:.45,
                                        layout: 'form',
                                        items: [new Ext.form.ClearableCombo({
                                            ref: '../../../../entitytypeCombo',
                                            fieldLabel: bundle.getMsg('entitytype.field.label')+'<span style="color:red;"><sup>*</sup></span>',
                                            anchor: '-20',
                                            store: window['EntitytypeApp'].comboStore,
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
                                                select : function(combo, record) {
                                                    window['EntityApp'].switchForm(record);
                                                }
                                            },
                                            onTrigger2Click: function(){ 
                                                var obj = new Object;
                                                obj.params = [window['EntityApp'].formPanel.tabPanel.generalPanel.entitytypeCombo];
                                                obj.fn = function(params){
                                                    var cmp = params[0];
                                                    var obj = params[1];
                                                    var mask = new Ext.LoadMask(window['EntitytypeApp'].window.getEl(), {
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
                                                window['EntitytypeApp'].gridPanel.getSelectionModel().clearSelections();
                                                window['EntitytypeApp'].showWindow(window['EntitytypeApp'].window.getEl(), true, obj);
                                            }
                                        })]
                                    },{
                                        columnWidth:.35,
                                        layout: 'form',
                                        items: [new Ext.form.ClearableCombo({
                                            ref: '../../../../organismCombo',
                                            fieldLabel: bundle.getMsg('entity.field.organism'),
                                            anchor: '-20',
                                            store: window['EntityApp'].comboStore,
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
                                                    window['EntityApp'].comboStore.setBaseParam('filter', '[{"value":"1","field":"isorganism"}]');
                                                    this.setValue(queryEvent.query);
                                                },
                                                select: function(combo, record, index ){
                                                    window['EntityApp'].organismRecord = record;
                                                    this.collapse();
                                                },
                                                blur: function(field) {		
                                                    if(field.getRawValue() == '')
                                                        window['EntityApp'].organismRecord = false;
                                                    else {
                                                        var record = field.getStore().getAt(field.getStore().find('name',field.getRawValue(), 0, true, true));								 
                                                        if(record && record.get('name') == field.getRawValue())
                                                            window['EntityApp'].organismRecord = record;
                                                        else {
                                                            window['EntityApp'].organismRecord = false;
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
                                        })]
                                    },{
                                        columnWidth:.2,
                                        layout: 'form',
                                        items: [{
                                            ref: '../../../../shortnameTextField',
                                            xtype:'textfield',
                                            name: 'shortname',
                                            fieldLabel: bundle.getMsg('entity.field.shortname'),
                                            anchor:'-20'
                                        }]
                                    }]
                                },{
                                    ref: '../../nameTextArea',
                                    xtype:'textarea',
                                    name: 'name',
                                    fieldLabel: bundle.getMsg('entity.field.name.jp')+'<span style="color:red;"><sup>*</sup></span>', 
                                    allowBlank: false,
                                    height: 40,
                                    maxLength: 200, 
                                    anchor:'-20'
                                },new Ext.TabPanel({
                                    ref: '../../tabPanel',
                                    deferredRender: false,
                                    height: 160,
                                    anchor:'-20',
                                    plain: true,
                                    defaults:{
                                        autoHeight:false
                                    }, 			
                                    activeTab: 0,
                                    border:true,
                                    items:[{
                                        ref: 'locationPanel',
                                        title: bundle.getMsg('location.field.label'),	
                                        iconCls: Ext.ux.Icon('flag_orange'),
                                        border:false,
                                        bodyStyle: 'padding:5px',
                                        layout: 'form',
                                        listeners: {
                                            activate: function(panel) {
                                                if(permissions.indexOf('managenationality') == -1 && permissions.indexOf('managenationalityadd') == -1 && window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.locationPanel.nationalityCombo.getTrigger(1).hide)
                                                    window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.locationPanel.nationalityCombo.getTrigger(1).hide();
                                            }
                                        },
                                        items: [{
                                            xtype:'textarea',
                                            name: 'address',
                                            fieldLabel: bundle.getMsg('app.form.address')+'<span style="color:red;"><sup>*</sup></span>', 
                                            height: 40,
                                            anchor:'-20'
                                        },{
                                            layout:'column',
                                            border: false,
                                            defaults:{
                                                border:false
                                            }, 	
                                            items:[{
                                                columnWidth:.5,
                                                layout: 'form',
                                                items: [new Ext.form.ClearableCombo({
                                                    ref: '../../locationCombo',
                                                    fieldLabel : bundle.getMsg('location.field.label'),
                                                    store: window['LocationApp'].comboStore,
                                                    anchor:'-20',
                                                    emptyText: bundle.getMsg('app.form.typehere'),
                                                    minChars: 1, //para q busque a partir de 1 caracter...
                                                    displayField: 'name',
                                                    typeAhead: false,
                                                    loadingText: bundle.getMsg('app.msg.wait.searching'),
                                                    pageSize: config.app_elementsongrid/2,
                                                    tpl: new Ext.XTemplate(
                                                        '<tpl for="."><div class="search-item">',
                                                        '<h3><span>{parent}</span>{name}</h3>',
                                                        '{comment}',
                                                        '</div></tpl>'
                                                        ),
                                                    itemSelector: 'div.search-item',
                                                    listeners: {
                                                        beforequery: function(queryEvent) {
                                                            this.setValue(queryEvent.query);
                                                        },
                                                        select: function(combo, record, index ){
                                                            window['EntityApp'].locationRecord = record;
                                                            this.collapse();
                                                        },
                                                        blur: function(field) {		
                                                            if(field.getRawValue() == '')
                                                                window['EntityApp'].locationRecord = false;
                                                            else {
                                                                var record = field.getStore().getAt(field.getStore().find('name',field.getRawValue(), 0, true, true));								 
                                                                if(record && record.get('name') == field.getRawValue())
                                                                    window['EntityApp'].locationRecord = record;
                                                                else {
                                                                    window['EntityApp'].locationRecord = false;
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
                                                })]
                                            },{
                                                columnWidth:.5,
                                                layout: 'form',
                                                items: [new Ext.form.ClearableCombo({
                                                    ref: '../../nationalityCombo',
                                                    fieldLabel: bundle.getMsg('nationality.field.label'),
                                                    anchor: '-20',
                                                    store: window['NationalityApp'].comboStore,
                                                    valueField: 'id', 
                                                    displayField: 'name',
                                                    tpl: '<tpl for="."><div ext:qtip="{name}:{comment}" class="x-combo-list-item">{name}</div></tpl>',
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
                                                            if(!combo.readOnly && !combo.disabled)
                                                                combo.getStore().load();
                                                        }
                                                    },
                                                    onTrigger2Click: function(){ 
                                                        var obj = new Object;
                                                        obj.params = [window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.locationPanel.nationalityCombo];
                                                        obj.fn = function(params){
                                                            var cmp = params[0];
                                                            var obj = params[1];
                                                            var mask = new Ext.LoadMask(window['NationalityApp'].window.getEl(), {
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
                                                        window['NationalityApp'].gridPanel.getSelectionModel().clearSelections();
                                                        window['NationalityApp'].showWindow(window['NationalityApp'].window.getEl(), true, obj);
                                                    }
                                                })]
                                            }]
                                        }]
                                    }, this.contactPanel, this.activityPanel, {
                                        ref: 'metadataPanel',
                                        title: bundle.getMsg('entity.tab.metadata'),	
                                        iconCls: Ext.ux.Icon('tag_red'),
                                        border:false,
                                        defaults:{
                                            border:false
                                        },    
                                        listeners: {
                                            activate: function(panel){
                                                panel.doLayout();
                                                panel.items.items[0].expand();                                                    
                                            }
                                        },
                                        layout: 'accordion',
                                        items:[{
                                            title: bundle.getMsg('entity.field.build.label'),
                                            layout: 'form',
                                            defaults:{
                                                border:false
                                            },   
                                            listeners: {
                                                expand: function(panel){
                                                    panel.doLayout();                                                    
                                                }
                                            },
                                            bodyStyle: 'padding:5px', 
                                            items: [{
                                                layout:'column',
                                                defaults:{
                                                    border:false
                                                }, 	
                                                items:[{
                                                    columnWidth:.32,
                                                    layout: 'form',
                                                    items: [new Ext.form.ClearableCombo({
                                                        ref: '../../../documenttypeCombo',
                                                        anchor:'-20',
                                                        fieldLabel: bundle.getMsg('documenttype.field.label'),
                                                        store: window['DocumenttypeApp'].comboStore,
                                                        valueField: 'id', 
                                                        displayField: 'name',
                                                        tpl: '<tpl for="."><div ext:qtip="{name}:{comment}" class="x-combo-list-item">{name}</div></tpl>',
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
                                                                if(!combo.readOnly && !combo.disabled)
                                                                    combo.getStore().load();
                                                            }
                                                        },
                                                        onTrigger2Click: function(){ 
                                                            var obj = new Object;
                                                            obj.params = [window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documenttypeCombo];
                                                            obj.fn = function(params){
                                                                var cmp = params[0];
                                                                var obj = params[1];
                                                                var mask = new Ext.LoadMask(window['EntityApp'].window.getEl(), {
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
                                                            window['DocumenttypeApp'].gridPanel.getSelectionModel().clearSelections();
                                                            window['DocumenttypeApp'].showWindow(window['DocumenttypeApp'].window.getEl(), true, obj);
                                                        }
                                                    })]
                                                },{
                                                    columnWidth:.23,
                                                    layout: 'form',
                                                    items: [{
                                                        xtype: 'compositefield',
                                                        fieldLabel: ' ',
                                                        labelSeparator: ' ',
                                                        anchor:'-20',
                                                        items: [{
                                                            xtype: 'displayfield', 
                                                            value: bundle.getMsg('entity.field.build.number')+':'
                                                        }, {
                                                            xtype: 'textfield',   
                                                            ref: '../../../../documentnumberTextField', 
                                                            flex: 1
                                                        }]
                                                    }]
                                                },{
                                                    columnWidth:.25,
                                                    layout: 'form',
                                                    items: [{
                                                        xtype: 'compositefield',
                                                        fieldLabel: ' ',
                                                        labelSeparator: ' ',
                                                        anchor:'-20',
                                                        items: [{
                                                            xtype: 'displayfield', 
                                                            value: bundle.getMsg('app.form.date')+':'
                                                        }, {
                                                            ref: '../../../../documentdateDateField',
                                                            xtype:'datefield', 
                                                            flex: 1
                                                        }]
                                                    }]
                                                }]
                                            }]
                                        },{
                                            title: bundle.getMsg('entity.field.reeup.label'),
                                            bodyStyle: 'padding:5px', 
                                            defaults:{
                                                border:false
                                            }, 
                                            listeners: {
                                                expand: function(panel){
                                                    panel.doLayout();                                                    
                                                }
                                            },
                                            items: [{
                                                layout:'column',
                                                defaults:{
                                                    border:false
                                                }, 	
                                                items:[{
                                                    columnWidth:.25,
                                                    layout: 'form',
                                                    items: [{
                                                        xtype: 'compositefield',
                                                        fieldLabel: ' ',
                                                        labelSeparator: ' ',
                                                        anchor:'-20',
                                                        items: [{
                                                            xtype: 'displayfield', 
                                                            value: bundle.getMsg('entity.field.reeup.tomo')+':'
                                                        }, {
                                                            xtype: 'textfield',  
                                                            ref: '../../../../reeuptomoTextField',   
                                                            flex: 1
                                                        }]
                                                    }]
                                                },{
                                                    columnWidth:.25,
                                                    layout: 'form',
                                                    items: [{
                                                        xtype: 'compositefield',
                                                        fieldLabel: ' ',
                                                        labelSeparator: ' ',
                                                        anchor:'-20',
                                                        items: [{
                                                            xtype: 'displayfield', 
                                                            value: bundle.getMsg('entity.field.reeup.folio')+':'
                                                        }, {
                                                            xtype: 'textfield',
                                                            ref: '../../../../reeupfolioTextField',     
                                                            flex: 1
                                                        }]
                                                    }]
                                                },{
                                                    columnWidth:.25,
                                                    layout: 'form',
                                                    items: [{
                                                        xtype: 'compositefield',
                                                        fieldLabel: ' ',
                                                        labelSeparator: ' ',
                                                        anchor:'-20',
                                                        items: [{
                                                            xtype: 'displayfield', 
                                                            value: bundle.getMsg('entity.field.reeup.page')+':'
                                                        }, {
                                                            xtype: 'textfield',   
                                                            ref: '../../../../reeuppageTextField',  
                                                            flex: 1
                                                        }]
                                                    }]
                                                },{
                                                    columnWidth:.25,
                                                    layout: 'form',
                                                    items: [{
                                                        xtype: 'compositefield',
                                                        fieldLabel: ' ',
                                                        labelSeparator: ' ',
                                                        anchor:'-20',
                                                        items: [{
                                                            xtype: 'displayfield', 
                                                            value: bundle.getMsg('app.form.date')+':'
                                                        }, {
                                                            xtype:'datefield', 
                                                            ref: '../../../../reeupdateDateField', 
                                                            flex: 1
                                                        }]
                                                    }]
                                                }]
                                            }]
                                        },{
                                            title: bundle.getMsg('entity.field.cuc.label'),
                                            bodyStyle: 'padding:5px', 
                                            defaults:{
                                                border:false
                                            }, 
                                            listeners: {
                                                expand: function(panel){
                                                    panel.doLayout();                                                    
                                                }
                                            }, 
                                            items: [{
                                                layout:'column',
                                                defaults:{
                                                    border:false
                                                }, 	
                                                items:[{
                                                    columnWidth:.35,
                                                    layout: 'form',
                                                    items: [{
                                                        xtype: 'compositefield',
                                                        fieldLabel: ' ',
                                                        labelSeparator: ' ',
                                                        anchor:'-20',
                                                        items: [{
                                                            xtype: 'displayfield', 
                                                            value: bundle.getMsg('entity.field.cuc.number')+':'
                                                        }, {
                                                            xtype: 'textfield',    
                                                            ref: '../../../../cucnumberTextField', 
                                                            flex: 1
                                                        }]
                                                    }]
                                                },{
                                                    columnWidth:.25,
                                                    layout: 'form',
                                                    items: [{
                                                        xtype: 'compositefield',
                                                        fieldLabel: ' ',
                                                        labelSeparator: ' ',
                                                        anchor:'-20',
                                                        items: [{
                                                            xtype: 'displayfield', 
                                                            value: bundle.getMsg('app.form.date')+':'
                                                        }, {
                                                            xtype:'datefield', 
                                                            ref: '../../../../cucdateDateField', 
                                                            flex: 1
                                                        }]
                                                    }]
                                                }]
                                            }]
                                        }]
                                    }, new Ext.grid.GridPanel({
                                        ref: 'paymentwayPanel',
                                        stripeRows: true,
                                        autoExpandColumn: 'entitypaymentwaymaincolumn',
                                        title: bundle.getMsg('entity.tab.paymentway'),
                                        iconCls: Ext.ux.Icon('star'),
                                        store: new Ext.data.Store({
                                            reader: new Ext.data.JsonReader()
                                        }),
                                        sm: new Ext.grid.RowSelectionModel({
                                            singleSelect:true, 
                                            listeners: {
                                                selectionchange: function(selectionModel) {
                                                    window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.removeBtn.setDisabled(selectionModel.getCount() < 1);
                                                }
                                            }
                                        }),	
                                        view: new Ext.grid.GridView({
                                            markDirty: false,
                                            forceFit:true
                                        }),
                                        columns: [new Ext.grid.RowNumberer(),{
                                            id:'entitypaymentwaymaincolumn', 
                                            header: bundle.getMsg('entity.tab.paymentway'),
                                            width: 100, 
                                            sortable: true, 
                                            dataIndex: 'name'
                                        }],
                                        tbar: [new Ext.Toolbar.TextItem(bundle.getMsg('entity.tab.paymentway')+'<span style="color:red;"><sup>*</sup></span>: '), {
                                            xtype:'textfield',
                                            ref: 'nameField',
                                            allowBlank: false,
                                            width: 400
                                        }, '->',{
                                            tooltip: bundle.getMsg('app.form.addrow'),
                                            iconCls: Ext.ux.Icon('table_row_insert'),
                                            listeners: {
                                                click: function(button, eventObject) { 
                                                    if(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.topToolbar.nameField.isValid()){
                                                        
                                                        window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.store.insert(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.store.getCount(), new Ext.data.Record({
                                                            name: window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.topToolbar.nameField.getValue()
                                                        }));                                                 
                                                        window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.reconfigure(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.getStore(), window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.getColumnModel());
                                                 
                                                        window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.topToolbar.nameField.reset();
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
                                                    var records = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.getSelectionModel().getSelections();
                                                    window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.store.remove(records);
                                                }
                                            }
                                        }]
                                    }), new Ext.grid.GridPanel({
                                        ref: 'paymentplacePanel',
                                        stripeRows: true,
                                        autoExpandColumn: 'entitypaymentplacemaincolumn',
                                        title: bundle.getMsg('entity.tab.paymentplace'),
                                        iconCls: Ext.ux.Icon('cart'),
                                        store: new Ext.data.Store({
                                            reader: new Ext.data.JsonReader()
                                        }),
                                        sm: new Ext.grid.RowSelectionModel({
                                            singleSelect:true, 
                                            listeners: {
                                                selectionchange: function(selectionModel) {
                                                    window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.removeBtn.setDisabled(selectionModel.getCount() < 1);
                                                }
                                            }
                                        }),	
                                        view: new Ext.grid.GridView({
                                            markDirty: false,
                                            forceFit:true
                                        }),
                                        columns: [new Ext.grid.RowNumberer(),{
                                            id:'entitypaymentplacemaincolumn', 
                                            header: bundle.getMsg('entity.tab.paymentplace'),
                                            width: 100, 
                                            sortable: true, 
                                            dataIndex: 'name'
                                        }],
                                        tbar: [new Ext.Toolbar.TextItem(bundle.getMsg('entity.tab.paymentplace')+'<span style="color:red;"><sup>*</sup></span>: '), {
                                            xtype:'textfield',
                                            ref: 'nameField',
                                            allowBlank: false,
                                            width: 400
                                        }, '->',{
                                            tooltip: bundle.getMsg('app.form.addrow'),
                                            iconCls: Ext.ux.Icon('table_row_insert'),
                                            listeners: {
                                                click: function(button, eventObject) { 
                                                    if(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.topToolbar.nameField.isValid()){
                                                        
                                                        window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.store.insert(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.store.getCount(), new Ext.data.Record({
                                                            name: window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.topToolbar.nameField.getValue()
                                                        }));                                                 
                                                        window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.reconfigure(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.getStore(), window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.getColumnModel());
                                                 
                                                        window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.topToolbar.nameField.reset();
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
                                                    var records = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.getSelectionModel().getSelections();
                                                    window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.store.remove(records);
                                                }
                                            }
                                        }]
                                    })]
                                })]
                            },{
                                border: false,
                                defaults:{
                                    border:false
                                },
                                columnWidth:.15,
                                layout: 'form',
                                items: [{
                                    items: [{
                                        xtype: 'box',
                                        autoEl: {
                                            tag: 'div',
                                            style: 'padding-bottom:20px',
                                            html: '<div id="logoLabel" style="width:100;text-align:center;">'+bundle.getMsg('entity.field.logo')+':</div><br/>\
                                                    <img id="logo" src="images/entity.png" width="100px" class="img-contact" style="cursor:pointer;border:1px solid 000" onclick="window[&#39;EntityApp&#39;].prepareshowPictureForm(&#39;logo&#39;, &#39;web/uploads/assets/logos&#39;, false, true, &#39;images/entity.png&#39;, true)" />'
                                        }
                                    }]
                                },{
                                    ref: '../../specialcodeTextField',
                                    xtype:'textfield',
                                    name: 'specialcode',
                                    fieldLabel: bundle.getMsg('entity.field.specialcode'),
                                    anchor:'-20'
                                },{
                                    xtype:'textfield',
                                    name: 'nit',
                                    fieldLabel: bundle.getMsg('entity.field.nit'),
                                    anchor:'-20'
                                }]
                            }]
                        }]
                    }, new Ext.grid.GridPanel({
                        ref: 'accountPanel',
                        stripeRows: true,
                        autoExpandColumn: 'entityaccountmaincolumn',
                        title: bundle.getMsg('entity.tab.account'),
                        iconCls: Ext.ux.Icon('money'),
                        store: new Ext.data.Store({
                            reader: new Ext.data.JsonReader()
                        }),
                        sm: new Ext.grid.RowSelectionModel({
                            singleSelect:true, 
                            listeners: {
                                selectionchange: function(selectionModel) {
                                    window['EntityApp'].formPanel.tabPanel.accountPanel.removeBtn.setDisabled(selectionModel.getCount() < 1);
                                }
                            }
                        }),	
                        view: new Ext.grid.GridView({
                            markDirty: false,
                            forceFit:true
                        }),
                        columns: [new Ext.grid.RowNumberer(),{
                            header: bundle.getMsg('entity.field.bank'),
                            width: 100, 
                            sortable: true, 
                            dataIndex: 'name'
                        },{
                            header: bundle.getMsg('entity.field.bank.office'),
                            width: 40, 
                            sortable: true, 
                            dataIndex: 'office'
                        },{
                            header: bundle.getMsg('app.form.address'),
                            width: 80, 
                            sortable: true, 
                            dataIndex: 'address'
                        },{
                            header: bundle.getMsg('entity.field.bank.owner'),
                            width: 80, 
                            sortable: true, 
                            dataIndex: 'owner'
                        },{
                            id:'entityaccountmaincolumn', 
                            header: bundle.getMsg('entity.field.bank.account'),
                            width: 130, 
                            sortable: true, 
                            dataIndex: 'account'
                        },{
                            header: bundle.getMsg('currency.field.label'),
                            width: 30, 
                            sortable: true, 
                            dataIndex: 'currency'
                        }],
                        tbar: [new Ext.Toolbar.TextItem(bundle.getMsg('entity.field.bank')+'<span style="color:red;"><sup>*</sup></span>: '), new Ext.form.ClearableCombo({
                            ref: 'bankCombo',
                            store: window['EntityApp'].comboStore,
                            width: 170,
                            emptyText: bundle.getMsg('app.form.typehere'),
                            minChars: 1, //para q busque a partir de 1 caracter...
                            displayField: 'name',
                            typeAhead: false,
                            loadingText: bundle.getMsg('app.msg.wait.searching'),
                            pageSize: config.app_elementsongrid/2,
                            allowBlank: false,
                            tpl: new Ext.XTemplate(
                                '<tpl for="."><div class="search-item">',
                                '<h3><span>{parent}</span>{name}</h3>',
                                '{comment}',
                                '</div></tpl>'
                                ),
                            itemSelector: 'div.search-item',
                            listeners: {
                                beforequery: function(queryEvent) {
                                    //[{"type":"string","value":"31","field":"specialcode"}]
                                    window['EntityApp'].comboStore.setBaseParam('filter', '[{"value":"1","field":"entitytypeid"}]');
                                    this.setValue(queryEvent.query);
                                },
                                select: function(combo, record, index ){
                                    window['EntityApp'].locationRecord = record;
                                    this.collapse();
                                },
                                blur: function(field) {		
                                    if(field.getRawValue() == '')
                                        window['EntityApp'].locationRecord = false;
                                    else {
                                        var record = field.getStore().getAt(field.getStore().find('name',field.getRawValue(), 0, true, true));								 
                                        if(record && record.get('name') == field.getRawValue())
                                            window['EntityApp'].locationRecord = record;
                                        else {
                                            window['EntityApp'].locationRecord = false;
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
                            value: '&nbsp;&nbsp;'+bundle.getMsg('entity.field.bank.office')+'<span style="color:red;"><sup>*</sup></span>: '
                        },{
                            xtype:'textfield',
                            ref: 'officeField',
                            allowBlank: false,
                            width: 40
                        },{
                            xtype: 'displayfield', 
                            value: '&nbsp;&nbsp;'+bundle.getMsg('app.form.address')+'<span style="color:red;"><sup>*</sup></span>: '
                        },{
                            xtype:'textfield',
                            ref: 'addressField',
                            allowBlank: false,
                            width: 150
                        },{
                            xtype: 'displayfield', 
                            value: '&nbsp;&nbsp;'+bundle.getMsg('entity.field.bank.owner')+'<span style="color:red;"><sup>*</sup></span>: '
                        },{
                            xtype:'textfield',
                            ref: 'ownerField',
                            allowBlank: false,
                            width: 150
                        },{
                            xtype: 'displayfield', 
                            value: '&nbsp;&nbsp;'+bundle.getMsg('entity.field.bank.account')+'<span style="color:red;"><sup>*</sup></span>: '
                        },{
                            xtype:'textfield',
                            ref: 'accountField',
                            allowBlank: false,
                            width: 110
                        },{
                            xtype: 'displayfield', 
                            value: '&nbsp;&nbsp;'+bundle.getMsg('currency.field.label')+'<span style="color:red;"><sup>*</sup></span>: '
                        },new Ext.form.ClearableCombo({
                            ref: 'currencyCombo',
                            width: 70,
                            store: window['CurrencyApp'].comboStore,
                            valueField: 'id', 
                            displayField: 'name',
                            tpl: '<tpl for="."><div ext:qtip="{name}:{comment}" class="x-combo-list-item">{name}</div></tpl>',
                            typeAhead: true,
                            forceSelection: true,
                            mode: 'local',
                            triggerAction: 'all',
                            selectOnFocus:true,
                            //                                            emptyText: bundle.getMsg('app.form.select'),
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
                                obj.params = [window['EntityApp'].formPanel.tabPanel.accountPanel.currencyCombo];
                                obj.fn = function(params){
                                    var cmp = params[0];
                                    var obj = params[1];
                                    var mask = new Ext.LoadMask(window['EntityApp'].window.getEl(), {
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
                                window['CurrencyApp'].gridPanel.getSelectionModel().clearSelections();
                                window['CurrencyApp'].showWindow(window['CurrencyApp'].window.getEl(), true, obj);
                            }
                        }), '->',{
                            tooltip: bundle.getMsg('app.form.addrow'),
                            iconCls: Ext.ux.Icon('table_row_insert'),
                            listeners: {
                                click: function(button, eventObject) { 
                                    if(window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.officeField.isValid()&&
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.accountField.isValid()&&
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.addressField.isValid()&&
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.currencyCombo.isValid()){
                                                        
                                        window['EntityApp'].accountRecord = window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.bankCombo.getStore().getAt(window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.bankCombo.getStore().find('name',window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.bankCombo.getRawValue(), 0, true, true));
                                        window['EntityApp'].accountRecord.set('office', window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.officeField.getValue());
                                        window['EntityApp'].accountRecord.set('account', window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.accountField.getValue());
                                        window['EntityApp'].accountRecord.set('address', window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.addressField.getValue());
                                        window['EntityApp'].accountRecord.set('owner', window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.ownerField.getValue());
                                                        
                                        var currency = window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.currencyCombo.getStore().getAt(window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.currencyCombo.getStore().find('name',window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.currencyCombo.getRawValue(), 0, true, true));
                                        window['EntityApp'].accountRecord.set('currency', currency.get('name'));
                                                        
                                        // important to generate document later !!!
                                        window['EntityApp'].accountRecord.set('officetitle', bundle.getMsg('entity.field.bank.office'));
                                        window['EntityApp'].accountRecord.set('accounttitle', bundle.getMsg('entity.field.bank.account'));
                                        window['EntityApp'].accountRecord.set('currencytitle', bundle.getMsg('currency.field.label'));
                                        window['EntityApp'].accountRecord.set('ownertitle', bundle.getMsg('entity.field.bank.owner'));
                                        window['EntityApp'].accountRecord.set('addresstitle', bundle.getMsg('app.form.address'));
                                                 
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.store.insert(window['EntityApp'].formPanel.tabPanel.accountPanel.store.getCount(), window['EntityApp'].accountRecord);
                                                 
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.reconfigure(window['EntityApp'].formPanel.tabPanel.accountPanel.getStore(), window['EntityApp'].formPanel.tabPanel.accountPanel.getColumnModel());
                                                 
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.officeField.reset();
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.ownerField.reset();
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.accountField.reset();
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.addressField.reset();
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.currencyCombo.reset();
                                        window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.bankCombo.reset();
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
                                    var records = window['EntityApp'].formPanel.tabPanel.accountPanel.getSelectionModel().getSelections();
                                    window['EntityApp'].formPanel.tabPanel.accountPanel.store.remove(records);
                                }
                            }
                        }],
                        listeners: {
                            activate: function(panel) {
                                if(permissions.indexOf('managecurrency') == -1 && permissions.indexOf('managecurrencyadd') == -1)
                                    window['EntityApp'].formPanel.tabPanel.accountPanel.currencyCombo.getTrigger(1).hide();
                                                
                                window['EntityApp'].formPanel.tabPanel.accountPanel.topToolbar.bankCombo.reset();
                            }
                        }
                    }), this.imagesPanel]
                })]
            });
            
        },
        
        renderEntity : function(data, callback){
            data.generaldata = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+bundle.getMsg('piece.action.nodatatodisplay');
            if(data.comment && data.comment!='')
                data.generaldata = data.comment;
            if(callback){
                callback(data.generaldata);
            }
                
            return data;
        },
        
        prepareshowPictureForm : function(showInId, uploadTo, processFn, redefineName, resetImg, webcamDisabled){
            Ext.getCmp('picture').regex = Date.patterns.OnlyImagesAllowed;
            showPictureForm(showInId, uploadTo, processFn, redefineName, resetImg, webcamDisabled);
        },
        
        showImportForm : function(showInId, uploadTo, processUpload){
            Ext.getCmp('picture').regex = /^.*.(xls|XLS|xlsx|XLSX)$/;
            //showInId, uploadTo, processFn, redefineName, resetImg, webcamDisabled
            showPictureForm(showInId, uploadTo, processUpload, true);
        },
        
        switchForm: function(record){
            window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.hideTabStripItem(2);
            window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.unhideTabStripItem(4);
            if(record && record != ''){
                switch(record.get('specialcode')){
                    case 'PN':
                    case 'TCP':
                        Ext.get(window['EntityApp'].formPanel.tabPanel.generalPanel.nameTextArea.label.id).dom.innerHTML = bundle.getMsg('app.form.longname')+'<span style="color:red;"><sup>*</sup></span>:';
                        Ext.get(window['EntityApp'].formPanel.tabPanel.generalPanel.specialcodeTextField.label.id).dom.innerHTML = bundle.getMsg('entity.field.specialcode.np')+':';
                        Ext.get(window['EntityApp'].formPanel.tabPanel.generalPanel.shortnameTextField.label.id).dom.innerHTML = bundle.getMsg('entity.field.shortname.np')+':';
                        window['EntityApp'].formPanel.tabPanel.generalPanel.organismCombo.setVisible(false);
                        window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.unhideTabStripItem(2);
                        if(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.getActiveTab().id == window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.get(3).id)
                            window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.setActiveTab(0);
                        window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.hideTabStripItem(3);
                        Ext.get('logoLabel').dom.innerHTML = bundle.getMsg('entity.field.logo.pn');
                        return;
                    default:
                        break;
                }
            }
            
            Ext.get(window['EntityApp'].formPanel.tabPanel.generalPanel.nameTextArea.label.id).dom.innerHTML = bundle.getMsg('entity.field.name.jp')+'<span style="color:red;"><sup>*</sup></span>:';
            Ext.get(window['EntityApp'].formPanel.tabPanel.generalPanel.specialcodeTextField.label.id).dom.innerHTML = bundle.getMsg('entity.field.specialcode')+':';
            Ext.get(window['EntityApp'].formPanel.tabPanel.generalPanel.shortnameTextField.label.id).dom.innerHTML = bundle.getMsg('entity.field.shortname')+':';
            window['EntityApp'].formPanel.tabPanel.generalPanel.organismCombo.setVisible(true);
            if(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.getActiveTab().id == window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.get(2).id)
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.setActiveTab(0);
            window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.hideTabStripItem(2);
            window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.unhideTabStripItem(3);
            Ext.get('logoLabel').dom.innerHTML = bundle.getMsg('entity.field.logo');
        },
        
        showWindow : function(animateTarget, hideApply, callback){
            var resetFn = function(){
                document.getElementById('logo').src = 'images/entity.png';
                window['EntityApp'].imagesPanel.items.items[0].getStore().removeAll();
                
                window['EntityApp'].contactPanel.getStore().removeAll();
                window['EntityApp'].activityPanel.getStore().removeAll();
                window['EntityApp'].formPanel.tabPanel.accountPanel.store.removeAll();
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.store.removeAll();
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.store.removeAll();
                
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documenttypeCombo.reset();
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documentnumberTextField.reset();
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documentdateDateField.reset();
                    
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeuptomoTextField.reset();
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeupfolioTextField.reset();
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeuppageTextField.reset();
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeupdateDateField.reset();
                    
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.cucnumberTextField.reset();
                window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.cucdateDateField.reset();
            };
                            
            window['EntityApp'].window = App.showWindow(bundle.getMsg('entity.window.title'), 1100, 400, window['EntityApp'].formPanel, 
                function(button){
                    if(!button){
                        button = new Object;
                        button.id = window['EntityApp'].window.submitBtn.id;
                    }
                
                    var records = window['EntityApp'].gridPanel.getSelectionModel().getSelections();
                    
                    var images = new Array();
                    for(var i = 0; i<window['EntityApp'].imagesPanel.items.items[0].getStore().getCount(); i++)
                        images.push(window['EntityApp'].imagesPanel.items.items[0].getStore().getAt(i).data);
                    
                    
                    
                    var indexes = new Array();
                    var values = new Array();
                    
                    var activitiesarray = new Array();
                    window['EntityApp'].activityPanel.getStore().each(function(record){
                        activitiesarray.push(record.data);
                    });     
                    values.push(activitiesarray);
                    indexes.push('activities');
                    
                    var contactsarray = new Array();
                    window['EntityApp'].contactPanel.getStore().each(function(record){
                        contactsarray.push(record.data);
                    });     
                    values.push(contactsarray);
                    indexes.push('contacts');
                    
                    var accountsarray = new Array();
                    window['EntityApp'].formPanel.tabPanel.accountPanel.store.each(function(record){
                        accountsarray.push(record.data);
                    });              
                    values.push(accountsarray);
                    indexes.push('accounts');
                    
                    var paymentwaysarray = new Array();
                    window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentwayPanel.store.each(function(record){
                        paymentwaysarray.push(record.data);
                    });              
                    values.push(paymentwaysarray);
                    indexes.push('paymentways');
                    
                    var paymentplacesarray = new Array();
                    window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.paymentplacePanel.store.each(function(record){
                        paymentplacesarray.push(record.data);
                    });              
                    values.push(paymentplacesarray);
                    indexes.push('paymentplaces');
                    
                    var metadata = new Object();
                    metadata.document = new Object();
                    metadata.document.type = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documenttypeCombo.getValue();
                    metadata.document.name = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documenttypeCombo.getRawValue();
                    metadata.document.number = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documentnumberTextField.getValue();
                    metadata.document.date = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documentdateDateField.getValue();
                    if(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documentdateDateField.getValue()!='')
                        metadata.document.date = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.documentdateDateField.getValue().format(Date.patterns.ISO8601Short);
                    metadata.reeup = new Object();
                    metadata.reeup.tomo = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeuptomoTextField.getValue();
                    metadata.reeup.tomotitle = bundle.getMsg('entity.field.reeup.tomo');
                    metadata.reeup.folio = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeupfolioTextField.getValue();
                    metadata.reeup.foliotitle = bundle.getMsg('entity.field.reeup.folio');
                    metadata.reeup.page = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeuppageTextField.getValue();
                    metadata.reeup.pagetitle = bundle.getMsg('entity.field.reeup.page');
                    metadata.reeup.date = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeupdateDateField.getValue();
                    metadata.reeup.datetitle = bundle.getMsg('app.form.date');
                    if(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeupdateDateField.getValue()!='')
                        metadata.reeup.date = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.reeupdateDateField.getValue().format(Date.patterns.ISO8601Short);
                    metadata.cuc = new Object();
                    metadata.cuc.tomo = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.cucnumberTextField.getValue();
                    metadata.cuc.tomotitle = bundle.getMsg('entity.field.cuc.number');
                    metadata.cuc.date = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.cucdateDateField.getValue();
                    metadata.cuc.datetitle = bundle.getMsg('app.form.date');
                    if(window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.cucdateDateField.getValue()!='')
                        metadata.cuc.date = window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.metadataPanel.cucdateDateField.getValue().format(Date.patterns.ISO8601Short);
                    
                    values.push(metadata);
                    indexes.push('metadatas');
							
                    window['EntityApp'].formPanel.getForm().submit({
                        waitTitle : bundle.getMsg('app.msg.wait.title'), 
                        waitMsg: bundle.getMsg('app.msg.wait.text'), 
                        clientValidation: true,
                        params: {
                            id: records[0] ? records[0].get('id'):'',
                            images: Ext.encode(images),
                            values: Ext.encode(values),
                            indexes: Ext.encode(indexes),
                            parentid: window['EntityApp'].organismRecord ? window['EntityApp'].organismRecord.get('id'):'',
                            locationid: window['EntityApp'].locationRecord ? window['EntityApp'].locationRecord.get('id'):'',
                            entitytypeid: window['EntityApp'].formPanel.tabPanel.generalPanel.entitytypeCombo.getValue(),
                            nationalityid: window['EntityApp'].formPanel.tabPanel.generalPanel.tabPanel.locationPanel.nationalityCombo.getValue(),
                            logo : document.getElementById('logo').src
                        },
                        success: function(form, action) {
                            checkSesionExpired(form, action);
                            window['EntityApp'].store.load({
                                params:{
                                    start: window['EntityApp'].gridPanel.getBottomToolbar().cursor
                                }
                            });
                            
                            var object = Ext.util.JSON.decode(action.response.responseText);  
                            if(config.app_entitys)
                                for(var i = 0; i < config.app_entitys.length; i++)
                                    if(config.app_entitys[i].id == object.data.id){
                                        config.app_entitys[i] = object.data;
                                        break;
                                    }
                            
                            submitFormSuccessful('EntityApp', form, action, button, !records[0], resetFn, callback);
                        },
                        failure: loadFormFailed
                    });
                
                }, 
                function(){
                    resetFn();
                    window['EntityApp'].formPanel.getForm().reset();
                    window['EntityApp'].window.hide();
                }, 
                animateTarget,
                false,
                false,
                false,
                hideApply ? hideApply : false);
        },
        
        applySecurity : function(groups, permissions){
            if(permissions.indexOf('manageentitytype') == -1 && permissions.indexOf('manageentitytypeadd') == -1)
                window['EntityApp'].formPanel.tabPanel.generalPanel.entitytypeCombo.getTrigger(1).hide();
            
            window['EntityApp'].gridPanel.addBtn.setVisible(permissions.indexOf('manageentity') != -1 || permissions.indexOf('manageentityadd') != -1);
            window['EntityApp'].gridPanel.updateBtn.setVisible(permissions.indexOf('manageentity') != -1 || permissions.indexOf('manageentityedit') != -1);
            window['EntityApp'].gridPanel.removeBtn.setVisible(permissions.indexOf('manageentity') != -1 || permissions.indexOf('manageentitydelete') != -1);
        }
    }
}();

