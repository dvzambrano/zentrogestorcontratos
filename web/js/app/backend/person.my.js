/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage person
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */

PersonApp = function() {
    return {
        init : function(PersonApp) {
			
            this.store = new Ext.data.GroupingStore({
                url: config.app_host + '/user/request/method/load',
                baseParams:{
                    component: 'grid',
                    start: 0,
                    entityid: config.app_entityid,
                    limit: config.app_elementsongrid
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records, bundle.getMsg('person.tab.label').toLowerCase());
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
                id: 'gridPanelPerson',
                region:'center',
                layout: 'fit', 
                iconCls: Ext.ux.Icon('tag_orange'),
                title: config.app_showgridtitle ? bundle.getMsg("person.grid.title") : '',
                autoExpandColumn: 'personcolname',
                store: this.store,
                loadMask: true,
                tools: [{
                    id:'print',
                    qtip: bundle.getMsg('app.languaje.report.printview'),
                    handler: function() {
                        App.printView(window['PersonApp'].gridPanel);
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
                        var text = App.getFiltersText(window['PersonApp'].gridPanel);
                        if(text && text!=''){
                            Ext.fly(window['PersonApp'].infoTextItem.getEl()).update(String.format(bundle.getMsg('app.form.filteringby'), text));
                            window['PersonApp'].infoTextItem.getEl().highlight('#FFFF66', {
                                block:true
                            });
                        }
                        else
                            Ext.fly(window['PersonApp'].infoTextItem.getEl()).update('');
                    }
                },
				
                columns: [new Ext.grid.RowNumberer(),{
                    header: bundle.getMsg('user.first.name'),
                    width: 150,
                    dataIndex: 'first_name'
                },{
                    id:'personcolname', 
                    header: bundle.getMsg('user.last.name'),
                    width: 250,
                    dataIndex: 'last_name'
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
                            window['PersonApp'].gridPanel.getSelectionModel().clearSelections();
                            window['PersonApp'].gridPanel.updateBtn.fireEvent('click', button, eventObject, hideApply, callback);
                        }
                    }
                },{
                    ref: '../updateBtn',
                    text: bundle.getMsg('app.form.info'),
                    disabled: true,
                    iconCls: Ext.ux.Icon('information'),
                    listeners: {
                        click: function(button, eventObject, hideApply, callback) {
                            var record = window['PersonApp'].gridPanel.getSelectionModel().getSelected();
                            if (record){
                                window['PersonApp'].formPanel.getForm().loadRecord(record);
                                var i = 0;
                                    
                                window['PersonApp'].contactPanel.getStore().removeAll();
                                        
                                if(record.get('Person')){
                                    window['PersonApp'].formPanel.idnField.setValue(record.get('Person').comment);
                                    
                                    if(record.get('Person').profile  && record.get('Person').profile !=''){
                                        var profile = Ext.decode(record.get('Person').profile);
                                        window['PersonApp'].formPanel.legalrepresentantCheckBox.setValue(Ext.decode(record.get('Person').profile).legalrepresentant);
                                        window['PersonApp'].formPanel.legalimportantCheckBox.setValue(Ext.decode(record.get('Person').profile).legalimportant);
                                            
                                        for (i = 0; profile.contacts && i < profile.contacts.length; i++)
                                            window['PersonApp'].contactPanel.getStore().insert(window['PersonApp'].contactPanel.getStore().getCount(), new Ext.data.Record(profile.contacts[i]));
                                        window['PersonApp'].contactPanel.reconfigure(window['PersonApp'].contactPanel.getStore(), window['PersonApp'].contactPanel.getColumnModel());
                                            
                                        for (i = 0; profile.positions && i < profile.positions.length; i++)
                                            window['PersonApp'].formPanel.tabPanel.positionPanel.store.insert(window['PersonApp'].formPanel.tabPanel.positionPanel.store.getCount(), new Ext.data.Record(profile.positions[i]));
                                        window['PersonApp'].formPanel.tabPanel.positionPanel.reconfigure(window['PersonApp'].formPanel.tabPanel.positionPanel.getStore(), window['PersonApp'].formPanel.tabPanel.positionPanel.getColumnModel());                                        
                                    }
                                }
                            }
                            else
                                window['PersonApp'].formPanel.getForm().reset();
                            window['PersonApp'].showWindow(button.getEl(), hideApply, callback);
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
                                            var records = window['PersonApp'].gridPanel.getSelectionModel().getSelections();
											
                                            var array = new Array();                                
                                            for (var i=0; i<records.length; i++)
                                                array.push(records[i].get('id'));
												
                                            new Ext.data.Connection().request({
                                                url: config.app_host + '/user/request/method/delete',
                                                params: {
                                                    ids: Ext.encode(array)
                                                },
                                                failure: requestFailed,
                                                success: requestSuccessful,
                                                callback : function(options, success, response) {
                                                    var object = Ext.decode(response.responseText);
                                                    if(object.success){
                                                        window['PersonApp'].store.load({
                                                            params:{
                                                                start: window['PersonApp'].gridPanel.getBottomToolbar().cursor
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
                            window['PersonApp'].gridPanel.filters.clearFilters();
                            Ext.fly(window['PersonApp'].infoTextItem.getEl()).update('');
                            window['PersonApp'].gridPanel.getSelectionModel().clearSelections();
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
            
            this.contactPanel = window['ContacttypeApp'].getPanelFor('person');
			
            this.formPanel = new Ext.FormPanel({
                labelWidth: 75,
                labelAlign: 'top',
                url: config.app_host + '/user/request/method/save',
                frame:true,
                bodyStyle:'padding:5px 5px 0',
                keys: [formKeyMaping],
                items: [{
                    layout:'column',
                    items:[{
                        columnWidth:.3,
                        layout: 'form',
                        items: [{
                            ref: '../../idnField',
                            xtype:'textfield',
                            name: 'idn',
                            anchor:'-20',
                            allowBlank:false,
                            fieldLabel: bundle.getMsg('app.form.idn')+'<span style="color:red;"><sup>*</sup></span>'
                        }]
                    },{
                        columnWidth:.3,
                        layout: 'form',
                        items: [{
                            xtype:'textfield',
                            name: 'first_name',
                            maskRe: Date.patterns.LettersOnly,
                            regex: Date.patterns.LettersOnly,
                            anchor:'-20',
                            allowBlank:false,
                            fieldLabel: bundle.getMsg('user.first.name')+'<span style="color:red;"><sup>*</sup></span>'
                        }]
                    },{
                        columnWidth:.4,
                        layout: 'form',
                        items: [{
                            xtype:'textfield',
                            name: 'last_name',
                            maskRe: Date.patterns.LettersOnly,
                            regex: Date.patterns.LettersOnly,
                            anchor:'-20',
                            allowBlank:false,
                            fieldLabel: bundle.getMsg('user.last.name')+'<span style="color:red;"><sup>*</sup></span>'
                        }]
                    }]
                },new Ext.form.Hidden({
                    ref: 'emailField',
                    name: 'email_address',
                    fieldLabel: bundle.getMsg('app.form.email')
                }), new Ext.TabPanel({
                    ref: 'tabPanel',
                    activeTab: 0,
                    anchor:'-20',
                    height:190,
                    plain:true,
                    defaults:{
                        autoScroll: true
                    },			
                    items:[new Ext.grid.GridPanel({
                        ref: 'positionPanel',
                        stripeRows: true,
                        autoExpandColumn: 'personpositionmaincolumn',
                        title: bundle.getMsg('position.tab.label'),
                        iconCls: Ext.ux.Icon('vcard'),
                        store: new Ext.data.Store({
                            reader: new Ext.data.JsonReader()
                        }),
                        sm: new Ext.grid.RowSelectionModel({
                            singleSelect:true, 
                            listeners: {
                                selectionchange: function(selectionModel) {
                                    window['PersonApp'].formPanel.tabPanel.positionPanel.removeBtn.setDisabled(selectionModel.getCount() < 1);
                                }
                            }
                        }),	
                        view: new Ext.grid.GridView({
                            markDirty: false,
                            forceFit:true
                        }),
                        columns: [new Ext.grid.RowNumberer(),{
                            header: bundle.getMsg('position.field.label'),
                            width: 100, 
                            sortable: true, 
                            dataIndex: 'name'
                        },{
                            header: bundle.getMsg('documenttype.field.label'),
                            width: 130, 
                            sortable: true, 
                            dataIndex: 'documenttype'
                        },{
                            id:'personpositionmaincolumn', 
                            header: bundle.getMsg('entity.tab.metadata'),
                            width: 150, 
                            sortable: true, 
                            dataIndex: 'metadata'
                        }],
                        tbar: [new Ext.Toolbar.TextItem(bundle.getMsg('position.field.label')+'<span style="color:red;"><sup>*</sup></span>: '), new Ext.form.ClearableCombo({
                            ref: '../positionCombo',
                            width: 110,
                            store: window['PositionApp'].comboStore,
                            valueField: 'id', 
                            displayField: 'name',
                            tpl: '<tpl for="."><div ext:qtip="{name}:{comment}" class="x-combo-list-item">{name}</div></tpl>',
                            typeAhead: true,
                            forceSelection: true,
                            mode: 'local',
                            triggerAction: 'all',
                            selectOnFocus:true,
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
                                    combo.store.setBaseParam('entityid', config.app_entityid);
                                    if(window['PersonApp'].window.entityid)
                                        combo.store.setBaseParam('entityid', window['PersonApp'].window.entityid);
                                    combo.store.params = combo.store.baseParams;
                            
                                    if(!combo.readOnly && !combo.disabled)
                                        combo.getStore().load();
                                }
                            },
                            onTrigger2Click: function(){ 
                                var obj = new Object;
                                obj.params = [window['PersonApp'].formPanel.tabPanel.positionPanel.positionCombo];
                                obj.entityid = config.app_entityid;
                                if(window['PersonApp'].window.entityid)
                                    obj.entityid = window['PersonApp'].window.entityid;
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
                                window['PositionApp'].gridPanel.getSelectionModel().clearSelections();
								
                                window['PositionApp'].showWindow(window['PositionApp'].window.getEl(), true, obj);
                            }
                        }),new Ext.form.ClearableCombo({
                            ref: '../documenttypeCombo',
                            width: 140,
                            store: window['DocumenttypeApp'].comboStore,
                            valueField: 'id', 
                            displayField: 'name',
                            tpl: '<tpl for="."><div ext:qtip="{name}:{comment}" class="x-combo-list-item">{name}</div></tpl>',
                            typeAhead: true,
                            forceSelection: true,
                            mode: 'local',
                            triggerAction: 'all',
                            selectOnFocus:true,
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
                                obj.params = [window['PersonApp'].formPanel.tabPanel.positionPanel.documenttypeCombo];
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
                                window['DocumenttypeApp'].gridPanel.getSelectionModel().clearSelections();
                                window['DocumenttypeApp'].showWindow(window['DocumenttypeApp'].window.getEl(), true, obj);
                            }
                        }),{
                            xtype:'textfield',
                            ref: '../metadataField',
                            width: 170
                        }, '->',{
                            tooltip: bundle.getMsg('app.form.addrow'),
                            iconCls: Ext.ux.Icon('table_row_insert'),
                            listeners: {
                                click: function(button, eventObject) { 
                                    if(window['PersonApp'].formPanel.tabPanel.positionPanel.positionCombo.isValid()&&
                                        window['PersonApp'].formPanel.tabPanel.positionPanel.documenttypeCombo.isValid()&&
                                        window['PersonApp'].formPanel.tabPanel.positionPanel.metadataField.isValid()){
                                                                                        
                                        window['PersonApp'].positionRecord = window['PersonApp'].formPanel.tabPanel.positionPanel.positionCombo.getStore().getAt(window['PersonApp'].formPanel.tabPanel.positionPanel.positionCombo.getStore().find('name',window['PersonApp'].formPanel.tabPanel.positionPanel.positionCombo.getRawValue(), 0, true, true));
                                        window['PersonApp'].positionRecord.set('documenttype', window['PersonApp'].formPanel.tabPanel.positionPanel.documenttypeCombo.getRawValue());
                                        window['PersonApp'].positionRecord.set('documenttypeid', window['PersonApp'].formPanel.tabPanel.positionPanel.documenttypeCombo.getValue());
                                        window['PersonApp'].positionRecord.set('metadata', window['PersonApp'].formPanel.tabPanel.positionPanel.metadataField.getValue());
                                                                                        
                                        // important to generate document later !!!
                                        window['PersonApp'].positionRecord.set('positiontitle', bundle.getMsg('entity.field.bank.position'));
                                        window['PersonApp'].positionRecord.set('documenttypetitle', bundle.getMsg('documenttype.field.label'));
                                        window['PersonApp'].positionRecord.set('metadatatitle', bundle.getMsg('dentity.tab.metadata'));
                                                                                 
                                        window['PersonApp'].formPanel.tabPanel.positionPanel.store.insert(window['PersonApp'].formPanel.tabPanel.positionPanel.store.getCount(), window['PersonApp'].positionRecord);
                                        window['PersonApp'].formPanel.tabPanel.positionPanel.reconfigure(window['PersonApp'].formPanel.tabPanel.positionPanel.getStore(), window['PersonApp'].formPanel.tabPanel.positionPanel.getColumnModel());
                                                                                 
                                        window['PersonApp'].formPanel.tabPanel.positionPanel.positionCombo.reset();
                                        window['PersonApp'].formPanel.tabPanel.positionPanel.documenttypeCombo.reset();
                                        window['PersonApp'].formPanel.tabPanel.positionPanel.metadataField.reset();
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
                                    var records = window['PersonApp'].formPanel.tabPanel.positionPanel.getSelectionModel().getSelections();
                                    window['PersonApp'].formPanel.tabPanel.positionPanel.store.remove(records);
                                }
                            }
                        }],
                        listeners: {
                            activate: function(panel) {
                                if(permissions.indexOf('manageposition') == -1 && permissions.indexOf('managepositionadd') == -1)
                                    window['PersonApp'].formPanel.tabPanel.positionPanel.positionCombo.getTrigger(1).hide();
                                window['PersonApp'].formPanel.tabPanel.positionPanel.positionCombo.reset();
                                if(permissions.indexOf('managedocumenttype') == -1 && permissions.indexOf('managedocumenttypeadd') == -1)
                                    window['PersonApp'].formPanel.tabPanel.positionPanel.documenttypeCombo.getTrigger(1).hide();
                                window['PersonApp'].formPanel.tabPanel.positionPanel.documenttypeCombo.reset();
                                window['PersonApp'].formPanel.tabPanel.positionPanel.metadataField.reset();
                            }
                        }
                    }), this.contactPanel]
                }),{
                    ref: 'legalrepresentantCheckBox',
                    xtype: 'checkbox',
                    name: 'legalrepresentant',
                    boxLabel: bundle.getMsg('person.field.legalrepresentant')
                },{
                    ref: 'legalimportantCheckBox',
                    xtype: 'checkbox',
                    name: 'legalimportant',
                    boxLabel: bundle.getMsg('person.field.legalimportant')
                }]
            });
            
        },
        
        renderPerson : function(data, callback){
            data.generaldata = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+bundle.getMsg('piece.action.nodatatodisplay');
            if(data.comment && data.comment!='')
                data.generaldata = data.comment;
            if(callback){
                callback(data.generaldata);
            }
                
            return data;
        },
        
        showWindow : function(animateTarget, hideApply, callback){
            var resetFn = function(){
                window['PersonApp'].window.entityid = false;
                try {
                    window['PersonApp'].formPanel.tabPanel.positionPanel.store.removeAll();
                    
                    window['PersonApp'].contactPanel.store.removeAll();
                } catch (exception) {}
            };
            
            window['PersonApp'].window = App.showWindow(bundle.getMsg('person.window.title'), 570, 430, window['PersonApp'].formPanel, 
                function(button){
                    if(!button){
                        button = new Object;
                        button.id = window['PersonApp'].window.submitBtn.id;
                    }
                    
                    var indexes = new Array();
                    var values = new Array();
                    
                    var contactsarray = new Array();
                    window['PersonApp'].contactPanel.getStore().each(function(record){
                        contactsarray.push(record.data);
                    }); 
                    values.push(contactsarray);
                    indexes.push('contacts');
                    
                    var positionsarray = new Array();
                    window['PersonApp'].formPanel.tabPanel.positionPanel.store.each(function(record){
                        positionsarray.push(record.data);
                    }); 
                    values.push(positionsarray);
                    indexes.push('positions');
                    
                    values.push(window['PersonApp'].formPanel.legalrepresentantCheckBox.checked);
                    indexes.push('legalrepresentant');
                    
                    values.push(window['PersonApp'].formPanel.legalimportantCheckBox.checked);
                    indexes.push('legalimportant');
                
                    var records = window['PersonApp'].gridPanel.getSelectionModel().getSelections();
                    
                    window['PersonApp'].formPanel.getForm().submit({
                        waitTitle : bundle.getMsg('app.msg.wait.title'), 
                        waitMsg: bundle.getMsg('app.msg.wait.text'), 
                        clientValidation: true,
                        params: {
                            app: 'frontend',
                            entities: callback && callback.entityid ? callback.entityid : config.app_entityid,
                            id: records[0] ? records[0].get('id'):''
                        },
                        success: function(form, action) {
                            var object = Ext.util.JSON.decode(action.response.responseText);
                            
                            new Ext.data.Connection().request({
                                url: config.app_host + '/person/request/method/save',
                                method: 'POST',
                                params: {
                                    id: object.data.id,
                                    comment: window['PersonApp'].formPanel.idnField.getValue(),
                                    picture: '',
                                    values: Ext.encode(values),
                                    indexes: Ext.encode(indexes)
                                },
                                callback : function(options, success, response) {
                                    checkSesionExpired(form, action);
                                    window['PersonApp'].store.load({
                                        params:{
                                            start: window['PersonApp'].gridPanel.getBottomToolbar().cursor
                                        }
                                    });
                                                 
                                    submitFormSuccessful('PersonApp', form, action, button, !records[0], resetFn, callback);
                                }
                            });
                        },
                        failure: loadFormFailed
                    });
                
                }, 
                function(){
                    resetFn();
                    window['PersonApp'].formPanel.getForm().reset();
                    window['PersonApp'].window.hide();
                }, 
                animateTarget,
                false,
                false,
                false,
                hideApply ? hideApply : false);
                
            if(callback && callback.entityid)
                window['PersonApp'].window.entityid = callback.entityid ;
        },
        
        applySecurity : function(groups, permissions){
            window['PersonApp'].gridPanel.addBtn.setVisible(permissions.indexOf('manageperson') != -1 || permissions.indexOf('managepersonadd') != -1);
            window['PersonApp'].gridPanel.updateBtn.setVisible(permissions.indexOf('manageperson') != -1 || permissions.indexOf('managepersonedit') != -1);
            window['PersonApp'].gridPanel.removeBtn.setVisible(permissions.indexOf('manageperson') != -1 || permissions.indexOf('managepersondelete') != -1);            
        }
    }
}();

