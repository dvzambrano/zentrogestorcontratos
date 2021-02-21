/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage location
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */

LocationApp = function() {
    return {
        init : function(LocationApp) {
            
            this.store = new Ext.data.GroupingStore({
                url: config.app_host + '/location/request/method/load',
                baseParams:{
                    component: 'grid',
                    start: 0
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {           
                        alertNoRecords(records);
                    },
                    loadexception: config.app_showmessageonstoreloadfailed ? loadStoreFailed : Ext.emptyFn
                }
            });
            
            this.comboStore = new Ext.data.Store({
                url: config.app_host + '/location/request/method/load',
                baseParams:{
                    component: 'combo'
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    load: config.app_showmessageonstoreloadsuccessful ? loadStoreSuccessful : function(store, records) {
                        for(var i = 0; i < records.length; i++){
                            records[i].set('icontip', '');
                            if(records[i].get('customicon') && records[i].get('customicon').icon != '' && records[i].get('customicon').icon != 'flag_orange.png')
                                records[i].set('icontip', '<img src="images/icons/famfamfamflag/'+records[i].get('customicon')+'" />');
                            else
                                records[i].set('icontip', '<img src="images/icons/famfamfam/flag_orange.png" />');
                        }
                        alertNoRecords(records, bundle.getMsg('location.tab.label').toLowerCase());
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
			
            this.gridPanel = new Ext.ux.tree.TreeGrid({
                id: 'gridPanelLocation',
                rootVisible:false,
                iconCls: Ext.ux.Icon('flag_orange'),
                
                region:'center',
                title: config.app_showgridtitle ? bundle.getMsg("location.grid.title") : '',
                autoExpandColumn: 'locationmaincolumn',
                enableDD: false,
                useArrows: false,
                lines: true,
                containerScroll: true,
                animate: true,
                columnsText: bundle.getMsg('app.layout.columns'),
                maskConfig: {
                    msg: bundle.getMsg("app.layout.loading")
                },
                keys: [panelKeysMap],
                
                view: new Ext.grid.GroupingView(),
                
                plugins: [this.filters],
                
                tools:[{
                    id:'refresh',
                    qtip: bundle.getMsg('app.languaje.refresh.label'),
                    handler:function(event,toolEl,panel,tc){
                        window['LocationApp'].gridPanel.getRootNode().removeAll();
                        window['LocationApp'].gridPanel.getLoader().load(window['LocationApp'].gridPanel.getRootNode());
                        
                        window['LocationApp'].gridPanel.expandBtn.setDisabled(false);
                        window['LocationApp'].gridPanel.collapseBtn.setDisabled(true);
                    }
                },{
                    id:'print',
                    qtip: bundle.getMsg('app.languaje.report.printview'),
                    handler: function() {
                        App.printView(window['LocationApp'].gridPanel);
                    }
                }],
                
                columns: [{
                    id:'locationmaincolumn', 
                    header: bundle.getMsg('app.form.name'), 
                    width: 260, 
                    sortable: true, 
                    dataIndex: 'name'
                },{
                    header: bundle.getMsg('app.form.comment'), 
                    width: 360, 
                    sortable: true, 
                    dataIndex: 'comment',
                    tpl: new Ext.XTemplate('{comment:this.renderValue}', {
                        renderValue: formatNull
                    })
                }],
                
                selModel: new Ext.tree.MultiSelectionModel({
                    listeners: {
                        selectionchange: App.selectionChange
                    }
                }),
                
                root: new Ext.tree.AsyncTreeNode({
                    text: 'root',
                    id:'NULL'
                }),
                
                listeners: {
                    click: function(node){
                        App.selectionChange(node.getOwnerTree().getSelectionModel());
                    },
                    beforedblclick: function(){
                        window['LocationApp'].gridPanel.updateBtn.fireEvent('click', window['LocationApp'].gridPanel.updateBtn);
                        return false;
                    },
                    beforeexpandnode: function(node, deep, anim){
                        node.getOwnerTree().collapseBtn.setDisabled(false);
                    },
                    beforecollapsenode: function(node, deep, anim){
                        node.getOwnerTree().expandBtn.setDisabled(false);
                    },
                    filterupdate: function(){
                        var text = App.getFiltersText(window['LocationApp'].gridPanel);
                        if(text && text!=''){
                            Ext.fly(window['LocationApp'].infoTextItem.getEl()).update(String.format(bundle.getMsg('app.form.filteringby'), text));
                            window['LocationApp'].infoTextItem.getEl().highlight('#FFFF66', {
                                block:true
                            });
                        }
                        else
                            Ext.fly(window['LocationApp'].infoTextItem.getEl()).update('');
                    }
                },
                
                loader: new Ext.tree.TreeLoader({
                    baseParams: {
                        component: 'tree',
                        start: 0
                    },
                    dataUrl: config.app_host + '/location/request/method/load',
                    listeners: {
                        load: function(treeLoader, node, response){
                            node.getOwnerTree().treeGridSorter = new Ext.ux.tree.TreeGridSorter(node.getOwnerTree(), {
                                property: node.getOwnerTree().columns[0].dataIndex
                            });
                            node.getOwnerTree().treeGridSorter.doSort(node);
                                
                            if(response.responseText.indexOf('signinForm')>0)
                                showSesionExpiredMsg();                            
                            
                            for(var i = 0; i < node.childNodes.length; i++){
                                if(!node.childNodes[i].attributes.deleteable || node.childNodes[i].attributes.deleteable == 0)
                                    node.childNodes[i].getUI().addClass('row-italic');
                                
                                node.childNodes[i].setIconCls(Ext.ux.Icon('flag_orange'));
                                if(node.childNodes[i].attributes && node.childNodes[i].attributes && node.childNodes[i].attributes.customicon && node.childNodes[i].attributes.customicon != ''){
                                    var extension = node.childNodes[i].attributes.customicon;
                                    while(extension.indexOf('.')>-1)
                                        extension = extension.substring(extension.indexOf('.')+1, extension.length);
                                    var icon = node.childNodes[i].attributes.customicon.replace('.'+extension, '');
                                    node.childNodes[i].setIconCls(Ext.ux.Icon(icon, 'famfamfamflag'));
                                }
                            }
                        }
                    }
                }),
                
                tbar: [{
                    text: bundle.getMsg('app.form.add'),
                    iconCls: Ext.ux.Icon('add'),
                    ref: '../addBtn',
                    listeners: {
                        click: function(button, eventObject, hideApply, callback) {
                            window['LocationApp'].gridPanel.getSelectionModel().clearSelections();
                            window['LocationApp'].gridPanel.updateBtn.fireEvent('click', button, eventObject, hideApply, callback);
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
                            var record = window['LocationApp'].gridPanel.getSelectionModel().getSelectedNodes();
                            if (record.length==1){
                                var dr = new Ext.data.Record({
                                    name: record[0].attributes.name,
                                    comment: record[0].attributes.comment,
                                    icon: record[0].attributes.customicon && record[0].attributes.customicon != 'flag_orange' ? record[0].attributes.customicon : '',
                                    parentid: record[0].attributes.parentid
                                });
                                if (!window['LocationApp'].parentRecord){
                                    window['LocationApp'].parentRecord = new Object;
                                    window['LocationApp'].parentRecord.data = new Object;
                                }
                                window['LocationApp'].parentRecord.id = record[0].attributes.parentid;
                                window['LocationApp'].parentRecord.data.path = record[0].parentNode.getPath();
                                
                                window['LocationApp'].formPanel.getForm().loadRecord(dr);
								
                                window['LocationApp'].formPanel.locationCombo.setRawValue(record[0].parentNode.attributes.name);
                            }
                            window['LocationApp'].showWindow(button.getEl(), hideApply, callback);
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
                                            var nodes = window['LocationApp'].gridPanel.getSelectionModel().getSelectedNodes();
                                        
                                            var array = new Array();                                
                                            for (var i=0; i<nodes.length; i++)
                                                array.push(nodes[i].id);
                                        
                                            new Ext.data.Connection().request({
                                                url: config.app_host + '/location/request/method/delete',
                                                params: {
                                                    ids: Ext.encode(array)
                                                },
                                                failure: requestFailed,
                                                success: requestSuccessful,
                                                callback : function(options, success, response) {
                                                    for (var i=0; i<nodes.length; i++){
                                                        nodes[i].unselect();
                                                        var el = Ext.fly(nodes[i].ui.elNode);
                                                        if(el)
                                                            el.ghost('l', {
                                                                callback: nodes[i].remove, 
                                                                scope: nodes[i], 
                                                                duration: .4
                                                            });
                                                    }
                                                    if(callback){
                                                        if(callback.fn)
                                                            callback.fn(callback.params);
                                                        else
                                                            callback();
                                                    }
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
                    text: bundle.getMsg('location.import.standardexcel'),
                    iconCls: Ext.ux.Icon('database_go'),
                    ref: '../importBtn',
                    listeners: {
                        click: function(button, eventObject, hideApply, callback) {
                            window['LocationApp'].showImportForm(false, 'web/uploads/import/location');
                        }
                    }
                },'-',{
                    ref: '../expandBtn',
                    iconCls: Ext.ux.Icon('expand-all', 'myicons'),
                    tooltip: bundle.getMsg('app.form.expandall'),
                    listeners: {
                        click: function() {
                            var nodes = window['LocationApp'].gridPanel.getSelectionModel().getSelectedNodes();
                            if(nodes.length>0)
                                for(var i = 0; i < nodes.length; i++)
                                    nodes[i].expand(true);
                            else{
                                window['LocationApp'].gridPanel.expandAll();
                                window['LocationApp'].gridPanel.expandBtn.setDisabled(true);
                                window['LocationApp'].gridPanel.collapseBtn.setDisabled(false);
                            }
                        }
                    }
                },{
                    ref: '../collapseBtn',
                    disabled: true,
                    iconCls: Ext.ux.Icon('collapse-all', 'myicons'),
                    tooltip: bundle.getMsg('app.form.collapseall'),
                    listeners: {
                        click: function() {
                            var nodes = window['LocationApp'].gridPanel.getSelectionModel().getSelectedNodes();
                            if(nodes.length>0)
                                for(var i = 0; i < nodes.length; i++)
                                    nodes[i].collapse(true);
                            else {
                                window['LocationApp'].gridPanel.collapseAll();
                                window['LocationApp'].gridPanel.expandBtn.setDisabled(false);
                                window['LocationApp'].gridPanel.collapseBtn.setDisabled(true);
                            }
                        }
                    }
                }],
                
                bbar: new Ext.PagingToolbar({
                    pageSize: Number.MAX_VALUE,
                    store: this.store,
                    items:[{
                        tooltip: bundle.getMsg('app.form.clearfilters'),
                        iconCls: Ext.ux.Icon('table_lightning'),
                        handler: function () {
                            window['LocationApp'].gridPanel.filters.clearFilters();
                            Ext.fly(window['LocationApp'].infoTextItem.getEl()).update('');
                            window['LocationApp'].gridPanel.getSelectionModel().clearSelections();
                        } 
                    },'-', this.infoTextItem],
                    doRefresh : function(){
                        window['LocationApp'].gridPanel.getLoader().load(window['LocationApp'].gridPanel.getRootNode());
                        
                        window['LocationApp'].gridPanel.expandBtn.setDisabled(false);
                        window['LocationApp'].gridPanel.collapseBtn.setDisabled(true);
                    },
                    displayInfo: true,
                    displayMsg: bundle.getMsg('app.bbar.msg'),
                    emptyMsg: bundle.getMsg('app.bbar.msg'),
                    listeners: {
                        render: function(toolbar) {
                            toolbar.items.items[4].setDisabled(true);
                        }
                    }
                })
            });
            
            this.formPanel = new Ext.FormPanel({
                labelWidth: 75,
                labelAlign: 'top',
                url: config.app_host + '/location/request/method/save',
                frame:true,
                bodyStyle:'padding:5px 5px 0',						        
                keys: [formKeyMaping],
                items: [{
                    xtype:'textfield',
                    name: 'name',
                    fieldLabel: bundle.getMsg('app.form.name')+'<span style="color:red;"><sup>*</sup></span>', 
                    allowBlank: false,         
                    maxLength: 130, 
                    anchor:'-20'
                }, new Ext.form.ClearableCombo({
                    ref: 'locationCombo',
                    fieldLabel : bundle.getMsg('location.field.parent'),
                    store: this.comboStore,
                    name: 'parentid',
                    anchor:'-20',
                    emptyText: bundle.getMsg('app.form.typehere'),
                    minChars: config.app_characteramounttofind,
                    displayField: 'name',
                    typeAhead: false,
                    loadingText: bundle.getMsg('app.msg.wait.searching'),
                    pageSize: config.app_elementsongrid/2,
                    tpl: new Ext.XTemplate(
                        '<tpl for="."><div class="search-item">',
                        '<h3><span>{parent}</span><img src="images/icons/famfamfam/{customicon}" height="12px"/> {name}</h3>',
                        '</div></tpl>'
                        ),
                    itemSelector: 'div.search-item',
                    listeners: {
                        beforequery: function(queryEvent) {
                            var node = window['LocationApp'].gridPanel.getSelectionModel().getSelectedNodes();
                            if (node && node.length>0){
                                node = node[0];
                                        
                                var elements = new Array();
                                var element = new Object;
                                element.id = node.id;
                                elements.push(element);
                                        
                                window['LocationApp'].comboStore.baseParams.distinct = Ext.encode(elements);
                            }
                            this.setValue(queryEvent.query);
                        },
                        select: function(combo, record, index ){
                            window['LocationApp'].parentRecord = record;
                            window['LocationApp'].comboStore.baseParams.distinct = '';
                            this.collapse();
                        },
                        blur: function(field) {		
                            if(field.getRawValue() == '')
                                window['LocationApp'].parentRecord = false;
                            else {
                                var record = field.getStore().getAt(field.getStore().findExact('name', field.getRawValue()));								 
                                if(record && record.get('name') == field.getRawValue())
                                    window['LocationApp'].parentRecord = record;
                                else {
                                    window['LocationApp'].parentRecord = false;
                                    field.markInvalid(bundle.getMsg('app.error.fieldinvalid'));
                                }
                            }
                            window['LocationApp'].comboStore.baseParams.distinct = '';
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
                }), {
                    xtype:'textarea',
                    name: 'comment',
                    fieldLabel: bundle.getMsg('app.form.comment'),          
                    maxLength: 400, 
                    anchor:'-20'
                }]
            });
        
        },
        
        resetLocationsPrimary : function(store){
            var records = store.getRange();
            for(var i = 0; i < records.length; i++){
                store.remove(records[i]);
                records[i].set('primary', false);
                store.insert(i, records[i]);   
            }
        },
        
        showImportForm : function(showInId, uploadTo){
            Ext.getCmp('picture').regex = /^.*.(xls|XLS|xlsx|XLSX)$/;
            //showInId, uploadTo, processFn, redefineName, resetImg, webcamDisabled
            showPictureForm(showInId, uploadTo, function(url){
                var msg=App.mask.msg;
                App.mask.msg=bundle.getMsg('app.layout.loading');
                App.mask.show();
                                        
                window['ExplorerApp'].readFile({
                    id:'web/' + url
                }, '', function(content){
                    var files = content[0];
                    files.shift();
                    files.shift();
                    var total = files.length;
                    var count = 0;

                    App.mask.hide();
                    App.mask.msg = msg;

                    var processFile = function(files, nextFn) {
                        var start = (files.length-total)*-1;
                        if(files && files.length>0){
                            var currentfile = Ext.util.Format.ellipsis(files[0][1], 30);

                            Ext.MessageBox.progress(bundle.getMsg('app.msg.wait.title'), String.format(bundle.getMsg('location.import.description'), start+1, total) + '...');
                            Ext.MessageBox.updateProgress(start/total, currentfile);

                            new Ext.data.Connection().request({
                                url: config.app_host + '/location/request/method/import',
                                method: 'POST',
                                params: { 
                                    code: files[0][0],
                                    name: files[0][1]
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
                                msg: String.format(bundle.getMsg('location.import.done'), count),
                                buttons: Ext.Msg.OK,
                                icon: Ext.MessageBox.INFO
                            });
                            resetTree(window['LocationApp'].gridPanel, false, false);
                        }
                    };

                    processFile(files, processFile);
                                                
                }, true, 'array');
            }, true);
        },
        
        addCodes : function(array, store){
            store.removeAll();
            for(var i = 0; array && i< array.length; i++)
                store.add(new Ext.data.Record({
                    id: array[i].id,
                    text: array[i].text,
                    primary: array[i].primary,
                    code: array[i].code
                })); 
        },
        
        getGridPanelFor : function(entity){ 
            var app = Ext.util.Format.capitalize(entity.toLowerCase())+'App';   
            return new Ext.grid.GridPanel({
                ref: 'locationGridPanel',
                stripeRows: true,
                autoExpandColumn: entity+'locationmaincolumn',
                title: bundle.getMsg('location.tab.label'),	
                iconCls: Ext.ux.Icon('book_open'),
                store: new Ext.data.Store({
                    url: config.app_host + '/location/request/method/load',
                    baseParams:{
                        component: 'combo'
                    },
                    reader: new Ext.data.JsonReader()
                }),
                plugins: [rowEditor.cloneConfig({
                    listeners: {
                        afteredit: function(roweditor, changes, record, rowIndex){
                            roweditor.grid.getStore().remove(record);
                            
                            if(changes.code)
                                record.set('code', changes.code);
                            if(changes.primary){
                                record.set('primary', changes.primary);   
                                window['LocationApp'].resetLocationsPrimary(roweditor.grid.getStore());
                            }
                            
                            roweditor.grid.getStore().insert(rowIndex, record);
                        }
                    }
                }), new Ext.ux.grid.GridFilters({
                    encode: true,
                    local: true,
                    menuFilterText: bundle.getMsg('app.languaje.find.label'),
                    filters: [{
                        type: 'string',
                        dataIndex: 'code'
                    },{
                        type: 'string',
                        dataIndex: 'name'
                    },{
                        type: 'string',
                        dataIndex: 'text'
                    },{
                        type: 'string',
                        dataIndex: 'comment'
                    },{
                        type: 'bool',
                        yesText: bundle.getMsg('app.form.yes'),
                        noText: bundle.getMsg('app.form.no'),
                        dataIndex: 'primary'
                    }]
                })],
                sm: new Ext.grid.RowSelectionModel({
                    singleSelect:true, 
                    listeners: {
                        selectionchange: function(selectionModel) {
                            var toolbar = selectionModel.grid.getTopToolbar();
                            if(toolbar)
                                toolbar.removeBtn.setDisabled(selectionModel.getCount() < 1);
                        }
                    }
                }),	
                view: new Ext.grid.GridView({
                    markDirty: false,
                    forceFit:true
                }),
                columns: [{
                    id: entity+'locationmaincolumn', 
                    header: bundle.getMsg('location.field.label'),
                    width: 50, 
                    sortable: true, 
                    dataIndex: 'text'
                },{
                    header: bundle.getMsg('app.form.code'),
                    width: 50, 
                    sortable: true, 
                    dataIndex: 'code',
                    editor: new Ext.form.TextField()
                },{
                    header: bundle.getMsg('location.field.primary'),
                    width: 20, 
                    sortable: true, 
                    dataIndex: 'primary',
                    editor: {
                        xtype: 'checkbox'
                    },
                    renderer : function(val) {
                        if (val && (val === 1 || val === true))
                            return '<img title="" src="../../../images/icons/famfamfam/tick.png" alt=""/>';
                        return '';
                    }
                }],
                tbar: [new Ext.ux.TreeCombo({
                    ref: 'locationCombo',
                    fieldLabel: bundle.getMsg('location.tab.label')+'<span style="color:red;"><sup>*</sup></span>',
                    emptyText: bundle.getMsg('app.form.select'),
                    typeAhead: true,
                    width: 150,
                    valueField: 'id',    
                    displayField: 'name',
                    triggerAction:'all', 
                    maxHeight: 225,
                    treeWidth: 225,
                    root: new Ext.tree.AsyncTreeNode({
                        text: 'root',
                        id:'NULL'
                    }),
                    rootVisible: false,
            
                    loader: new Ext.tree.TreeLoader({
                        dataUrl: config.app_host + '/location/request/method/load/component/tree',                          
                        listeners: {
                            load: function(treeLoader, node, response){
                                if(response.responseText.indexOf('signinForm')>0)
                                    showSesionExpiredMsg();
                                        
                                for(var i = 0; i < node.childNodes.length; i++)
                                    if(node.childNodes[i].attributes && node.childNodes[i].attributes && node.childNodes[i].attributes!='')
                                        node.childNodes[i].setIconCls(Ext.ux.Icon(node.childNodes[i].attributes, 'famfamfam'));
                                
                            }
                        }
                    }),
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
                        select: function(combo, node){
                            combo.el.removeClass(combo.emptyClass);
                            window['LocationApp'].locationRecord = node;
                            combo.clearInvalid();
                        },
                        beforequery: function(queryEvent) {
                            queryEvent.combo.getTree().setHeight(queryEvent.combo.maxHeight);
                            this.setValue(queryEvent.query);
                        }
                    },
                    onTrigger2Click: function(){ 
                        var obj = new Object;
                        obj.params = [window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().locationCombo];
                        obj.fn = function(params){
                            var cmp = params[0];
                            var obj = params[1];                                    
                                    
                            if (!window['LocationApp'].locationRecord)
                                window['LocationApp'].locationRecord = new Object;
                            window['LocationApp'].locationRecord.id = obj.data.id;
                            window['LocationApp'].locationRecord.text = obj.data.name;
                            cmp.setRawValue(obj.data.name);
                            cmp.el.removeClass(cmp.emptyClass);
                        };
                        window['LocationApp'].showWindow(window['LocationApp'].window.getEl(), true, obj);
                    },
                    allowBlank:false
                }), {
                    xtype: 'displayfield', 
                    value: '&nbsp;&nbsp;'
                }, new Ext.Toolbar.TextItem(bundle.getMsg('app.form.code')+'<span style="color:red;"><sup>*</sup></span>'+': '),{
                    ref: 'codeField',
                    xtype:'textfield',
                    width: 120,
                    allowBlank:false
                }, {
                    xtype: 'displayfield', 
                    value: '&nbsp;&nbsp;'
                },{
                    ref: 'primaryCheckBox',
                    xtype: 'checkbox',
                    fieldLabel: '',
                    boxLabel: bundle.getMsg('location.field.primary')
                }, '->', {
                    tooltip: bundle.getMsg('app.form.addrow'),
                    iconCls: Ext.ux.Icon('table_row_insert'),
                    listeners: {
                        click: function() {  
                            if(window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().locationCombo.isValid() && 
                                window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().codeField.isValid()){
                                var record = window['LocationApp'].formPanel.tabPanel.locationGridPanel.getStore().getAt(window['LocationApp'].formPanel.tabPanel.locationGridPanel.getStore().find('id', window['LocationApp'].locationRecord.id, 0, true, true));
                                    
                                if(record)
                                    window['LocationApp'].formPanel.tabPanel.locationGridPanel.getStore().remove(record);
                                else
                                    record = new Ext.data.Record({
                                        id: window['LocationApp'].locationRecord.id,
                                        text: window['LocationApp'].locationRecord.text
                                    });
                                    
                                record.set('code', window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().codeField.getValue());
                                record.set('primary', window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().primaryCheckBox.getValue());
                                        
                                if(window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().primaryCheckBox.getValue())
                                    window['LocationApp'].resetLocationsPrimary(window['LocationApp'].formPanel.tabPanel.locationGridPanel.getStore());
                                    
                                window['LocationApp'].formPanel.tabPanel.locationGridPanel.getStore().insert(window['LocationApp'].formPanel.tabPanel.locationGridPanel.getStore().getCount(), record);
                                    
                                window['LocationApp'].locationRecord = false;
                                window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().locationCombo.reset();
                                window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().locationCombo.el.addClass(window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().locationCombo.emptyClass);
                                    
                                window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().codeField.reset();
                                window['LocationApp'].formPanel.tabPanel.locationGridPanel.getTopToolbar().primaryCheckBox.reset();
                            }
                        }
                    }
                },{
                    ref: 'removeBtn',
                    tooltip: bundle.getMsg('app.form.deleterow'),
                    iconCls: Ext.ux.Icon('table_row_delete'),
                    listeners: {
                        click: function() {
                            var records = window['LocationApp'].formPanel.tabPanel.locationGridPanel.getSelectionModel().getSelections();
                            window['LocationApp'].formPanel.tabPanel.locationGridPanel.getStore().remove(records);
                        }
                    }
                }]
            });
        },
        
        showWindow : function(animateTarget, hideApply, callback){            
            window['LocationApp'].window = App.showWindow(bundle.getMsg('location.window.title'), 370, 280, window['LocationApp'].formPanel, 
                function(button){
                    var nodes = window['LocationApp'].gridPanel.getSelectionModel().getSelectedNodes();
                    var node = false;
                    if(nodes && nodes.length>0)
                        node = nodes[0];
					
                    window['LocationApp'].formPanel.getForm().submit({
                        waitTitle : bundle.getMsg('app.msg.wait.title'), 
                        waitMsg: bundle.getMsg('app.msg.wait.text'), 
                        clientValidation: true,
                        //submitEmptyText: false,
                        params: {
                            id: node ? node.id:'',
                            parent_id: window['LocationApp'].parentRecord ? window['LocationApp'].parentRecord.id :'',
                            path: window['LocationApp'].parentRecord ? window['LocationApp'].parentRecord.data.path : window['LocationApp'].gridPanel.getRootNode().getPath()
                        },
                        success: function(form, action) {
                            checkSesionExpired(form, action);     
                            if(node)
                                window['LocationApp'].gridPanel.expandBtn.setDisabled(false);
                                
                            resetTree(window['LocationApp'].gridPanel, node, window['LocationApp'].parentRecord ? window['LocationApp'].parentRecord : false);
                            
                            submitFormSuccessful('LocationApp', form, action, button, !node, function(){
                                window['LocationApp'].parentRecord = false;
                            }, callback);
                        },
                        failure: loadFormFailed
                    });
                }, 
                function(){
                    window['LocationApp'].parentRecord = false;
                
                    var node = window['LocationApp'].gridPanel.getSelectionModel().getSelectedNodes();
                    if(node && node.length>0){
                        node = node[0];
                        window['LocationApp'].gridPanel.expandBtn.setDisabled(false);
                        resetTree(window['LocationApp'].gridPanel, node, false);
                    }
                
                    window['LocationApp'].window.hide();
                }, 
                animateTarget,
                false,
                false,
                false,
                hideApply ? hideApply : false);
        },
        
        applySecurity : function(groups, permissions){
            window['LocationApp'].gridPanel.addBtn.setVisible(permissions.indexOf('managelocation') != -1 || permissions.indexOf('managelocationadd') != -1);
            window['LocationApp'].gridPanel.updateBtn.setVisible(permissions.indexOf('managelocation') != -1 || permissions.indexOf('managelocationedit') != -1);
            window['LocationApp'].gridPanel.removeBtn.setVisible(permissions.indexOf('managelocation') != -1 || permissions.indexOf('managelocationdelete') != -1);            
        }
    }
}();

