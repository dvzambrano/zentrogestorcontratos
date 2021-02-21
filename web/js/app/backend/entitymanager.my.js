/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage entity
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */

EntitymanagerApp = function() {
    return {
        init : function(EntitymanagerApp) {
            
            Ext.chart.Chart.CHART_URL = config.app_host + '/../js/extjs/resources/charts.swf';
                        
            this.opinionsPanel = window['NoteApp'].getPanelFor('Entitymanager', 'Entity', config.app_entityid, {
                label:{
                    newnote: bundle.getMsg('entity.field.newopinion')
                },
                icon: {
                    add: 'comment_add',
                    reply: 'comment_edit',
                    del: 'comment_delete'
                }
            });
            
            this.contractbyreclamationtypeStore = new Ext.data.Store({
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
            this.contractbydateStore = new Ext.data.Store({
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
            this.contractaprovedStore = new Ext.data.Store({
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
            this.contractfinishStore = new Ext.data.Store({
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
            this.contractentitytypeStore = new Ext.data.Store({
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
			
            this.gridPanel = new Ext.Panel({
                id: 'gridPanelEntitymanager',
                title: bundle.getMsg('entity.field.label'),
                iconCls: Ext.ux.Icon('building'),
                header: false,
                border: false,
                region:'center',
                layout:'border',
                defaults: {
                    split: true
                },
                listeners: {
                    activate: function(gridpanel){
                        window['EntitymanagerApp'].loadContractbyDateData();
                        window['EntitymanagerApp'].loadContractAprovedData();
                        window['EntitymanagerApp'].loadContractFinishData();
                        window['EntitymanagerApp'].loadContractEntitytypeData();
                        
                        window['EntitymanagerApp'].loadContractbyReclamationTypeData();
                        
                        gridpanel.tabPanel.setActiveTab(0);
                        window['EntitymanagerApp'].opinionsPanel.items.items[0].getBottomToolbar().store.removeAll();
                        window['EntitymanagerApp'].opinionsPanel.items.items[0].getBottomToolbar().store.baseParams.entityid = config.app_entityid;
                        window['EntitymanagerApp'].opinionsPanel.items.items[0].getBottomToolbar().store.load();
                    }
                },
                items: [new Ext.TabPanel({
                    ref: 'tabPanel',
                    flex: 1,			
                    activeTab: 0,
                    collapsible: false,
                    region:'center',
                    items:[{
                        title: bundle.getMsg('entity.field.chartstatus'),
                        iconCls: Ext.ux.Icon('chart_curve'),
                        border: false,
                        layout:'border',
                        defaults: {
                            collapsible: true,
                            collapseMode: 'mini',
                            header: false,
                            border: false,
                            split: true,
                            bodyStyle: 'padding:15px'
                        },
                        items: [{
                            region:'west',
                            margins: '5 0 5 5',
                            width: 450,
                            minSize: 350,
                            maxSize: 750,
                            layout: 'border',
                            defaults: {
                                split: true
                            },
                            items: [{
                                region:'center',
                                title: bundle.getMsg('contract.chart.bydate'),
                                defaults: {
                                    border: false
                                },
                                layout:'card',
                                activeItem: 0,
                                tools: [{
                                    id:'right',
                                    qtip: bundle.getMsg('app.form.longcomment'),
                                    handler: window['EntitymanagerApp'].flipCardData
                                },{
                                    id:'refresh',
                                    qtip: bundle.getMsg('app.languaje.refresh.label'),
                                    handler: function(){
                                        window['EntitymanagerApp'].loadContractbyDateData();
                                    }
                                },{
                                    id:'print',
                                    qtip: bundle.getMsg('app.languaje.report.printview'),
                                    handler: function(){
                                        App.printView('/contract/graph/title/contract.chart.bydate/id/'+config.app_entityid, ' ', ' ');
                                    }
                                }],
                                items: [{
                                    items: {
                                        xtype: 'stackedbarchart',
                                        store: this.contractbydateStore,
                                        yField: 'name',
                                        xAxis: new Ext.chart.NumericAxis({
                                            stackingEnabled: true
                                        }),
                                        series: [{
                                            xField: 'amount'
                                        }]
                                    }
                                },new Ext.grid.GridPanel({
                                    store: this.contractbydateStore,
                                    loadMask: true,
                                    stripeRows: true,
                                    autoExpandColumn: 'contractbydatecolname',
                                    columns: [{
                                        id:'contractbydatecolname', 
                                        header: bundle.getMsg('app.form.name'), 
                                        width: 200, 
                                        sortable: true, 
                                        dataIndex: 'name'
                                    },{
                                        header: bundle.getMsg('app.form.value'), 
                                        width: 60, 
                                        sortable: true, 
                                        align: 'center',
                                        dataIndex: 'amount',
                                        renderer: function(value, metaData, record) {
                                            if(value > 0)
                                                return '<a href="#" onclick="javascript:App.printView(&#39;/contract/report/id/'+record.get('id')+'/entityid/'+config.app_entityid+'/title/'+record.get('name')+'&#39;, &#39; &#39;, &#39; &#39;);" style="text-decoration: none;">'+value+'</a>';
                                            return value;
                                        }
                                    }]
                                })]
                            },{
                                region:'south',
                                collapsible: true,
                                collapseMode: 'mini',
                                title: bundle.getMsg('contract.chart.aproved'),
                                defaults: {
                                    border: false
                                },
                                height: 250,
                                minSize: 150,
                                maxSize: 350,
                                layout:'card',
                                activeItem: 0,
                                tools: [{
                                    id:'right',
                                    qtip: bundle.getMsg('app.form.longcomment'),
                                    handler: window['EntitymanagerApp'].flipCardData
                                },{
                                    id:'refresh',
                                    qtip: bundle.getMsg('app.languaje.refresh.label'),
                                    handler: function(){
                                        window['EntitymanagerApp'].loadContractAprovedData();
                                    }
                                },{
                                    id:'print',
                                    qtip: bundle.getMsg('app.languaje.report.printview'),
                                    handler: function(){
                                        App.printView('/contract/graph/title/contract.chart.aproved/id/'+config.app_entityid, ' ', ' ');
                                    }
                                }],
                                items: [{
                                    items: {
                                        xtype: 'stackedbarchart',
                                        store: this.contractaprovedStore,
                                        yField: 'name',
                                        xAxis: new Ext.chart.NumericAxis({
                                            stackingEnabled: true
                                        }),
                                        series: [{
                                            xField: 'client',
                                            displayName: bundle.getMsg('contract.field.client')
                                        },{
                                            xField: 'phantom1'
                                        },{
                                            xField: 'phantom2'
                                        },{
                                            xField: 'provider',
                                            displayName: bundle.getMsg('contract.field.provider')
                                        }]
                                    }
                                },new Ext.grid.GridPanel({
                                    store: this.contractaprovedStore,
                                    loadMask: true,
                                    stripeRows: true,
                                    autoExpandColumn: 'contractaprovedcolname',
                                    columns: [{
                                        id:'contractaprovedcolname', 
                                        header: bundle.getMsg('app.form.name'), 
                                        width: 200, 
                                        sortable: true, 
                                        dataIndex: 'name'
                                    },{
                                        header: bundle.getMsg('contract.field.client'), 
                                        width: 60, 
                                        sortable: true, 
                                        align: 'center',
                                        dataIndex: 'client',
                                        renderer: function(value, metaData, record) {
                                            if(value > 0)
                                                return '<a href="#" onclick="javascript:App.printView(&#39;/contract/report/id/dateclient/entityid/'+config.app_entityid+
                                                '/date/start'+
                                                '/month/'+record.get('id')+
                                                '/title/'+bundle.getMsg('contract.chart.aproved')+' ['+record.get('name')+']&#39;, &#39; &#39;, &#39; &#39;);" style="text-decoration: none;">'+value+'</a>';
                                            return value;
                                        }
                                    },{
                                        header: bundle.getMsg('contract.field.provider'), 
                                        width: 60, 
                                        sortable: true, 
                                        align: 'center',
                                        dataIndex: 'provider',
                                        renderer: function(value, metaData, record) {
                                            if(value > 0)
                                                return '<a href="#" onclick="javascript:App.printView(&#39;/contract/report/id/dateprovider/entityid/'+config.app_entityid+
                                                '/date/start'+
                                                '/month/'+record.get('id')+
                                                '/title/'+bundle.getMsg('contract.chart.aproved')+' ['+record.get('name')+']&#39;, &#39; &#39;, &#39; &#39;);" style="text-decoration: none;">'+value+'</a>';
                                            return value;
                                        }
                                    }]
                                })]
                            }]
                        },{
                            region:'center',
                            margins: '5 0 5 0',
                            layout:'border',
                            defaults: {
                                split: true
                            },
                            items: [{
                                region:'center',
                                title: bundle.getMsg('contract.chart.entitytype'),
                                defaults: {
                                    border: false
                                },
                                layout:'card',
                                activeItem: 0,
                                tools: [{
                                    id:'right',
                                    qtip: bundle.getMsg('app.form.longcomment'),
                                    handler: window['EntitymanagerApp'].flipCardData
                                },{
                                    id:'refresh',
                                    qtip: bundle.getMsg('app.languaje.refresh.label'),
                                    handler: function(){
                                        window['EntitymanagerApp'].loadContractEntitytypeData();
                                    }
                                },{
                                    id:'print',
                                    qtip: bundle.getMsg('app.languaje.report.printview'),
                                    handler: function(){
                                        App.printView('/contract/graph/title/contract.chart.entitytype/id/'+config.app_entityid, ' ', ' ');
                                    }
                                }],
                                items: [{
                                    items: {
                                        xtype: 'stackedbarchart',
                                        store: this.contractentitytypeStore,
                                        yField: 'name',
                                        xAxis: new Ext.chart.NumericAxis({
                                            stackingEnabled: true
                                        }),
                                        series: [{
                                            xField: 'client',
                                            displayName: bundle.getMsg('contract.field.client')
                                        },{
                                            xField: 'phantom1'
                                        },{
                                            xField: 'phantom2'
                                        },{
                                            xField: 'provider',
                                            displayName: bundle.getMsg('contract.field.provider')
                                        }]
                                    }
                                },new Ext.grid.GridPanel({
                                    store: this.contractentitytypeStore,
                                    loadMask: true,
                                    stripeRows: true,
                                    autoExpandColumn: 'contractentitytypecolname',
                                    columns: [{
                                        id:'contractentitytypecolname', 
                                        header: bundle.getMsg('app.form.name'), 
                                        width: 200, 
                                        sortable: true, 
                                        dataIndex: 'name'
                                    },{
                                        header: bundle.getMsg('contract.field.client'), 
                                        width: 60, 
                                        sortable: true, 
                                        align: 'center',
                                        dataIndex: 'client',
                                        renderer: function(value, metaData, record) {
                                            if(value > 0)
                                                return '<a href="#" onclick="javascript:App.printView(&#39;/contract/report/id/entitytypeclient/entityid/'+config.app_entityid+
                                                '/entitytypeid/'+record.get('id')+
                                                '/title/'+bundle.getMsg('contract.chart.entitytype')+' ['+record.get('name')+']&#39;, &#39; &#39;, &#39; &#39;);" style="text-decoration: none;">'+value+'</a>';
                                            return value;
                                        }
                                    },{
                                        header: bundle.getMsg('contract.field.provider'), 
                                        width: 60, 
                                        sortable: true, 
                                        align: 'center',
                                        dataIndex: 'provider',
                                        renderer: function(value, metaData, record) {
                                            if(value > 0)
                                                return '<a href="#" onclick="javascript:App.printView(&#39;/contract/report/id/entitytypeprovider/entityid/'+config.app_entityid+
                                                '/entitytypeid/'+record.get('id')+
                                                '/title/'+bundle.getMsg('contract.chart.entitytype')+' ['+record.get('name')+']&#39;, &#39; &#39;, &#39; &#39;);" style="text-decoration: none;">'+value+'</a>';
                                            return value;
                                        }
                                    }]
                                })]
                            },{
                                region:'south',
                                collapsible: true,
                                collapseMode: 'mini',
                                title: bundle.getMsg('contract.chart.finish'),
                                defaults: {
                                    border: false
                                },
                                height: 250,
                                minSize: 150,
                                maxSize: 350,
                                layout:'card',
                                activeItem: 0,
                                tools: [{
                                    id:'right',
                                    qtip: bundle.getMsg('app.form.longcomment'),
                                    handler: window['EntitymanagerApp'].flipCardData
                                },{
                                    id:'refresh',
                                    qtip: bundle.getMsg('app.languaje.refresh.label'),
                                    handler: function(){
                                        window['EntitymanagerApp'].loadContractFinishData();
                                    }
                                },{
                                    id:'print',
                                    qtip: bundle.getMsg('app.languaje.report.printview'),
                                    handler: function(){
                                        App.printView('/contract/graph/title/contract.chart.finish/id/'+config.app_entityid, ' ', ' ');
                                    }
                                }],
                                items: [{
                                    items: {
                                        xtype: 'stackedbarchart',
                                        store: this.contractfinishStore,
                                        yField: 'name',
                                        xAxis: new Ext.chart.NumericAxis({
                                            stackingEnabled: true
                                        }),
                                        series: [{
                                            xField: 'client',
                                            displayName: bundle.getMsg('contract.field.client')
                                        },{
                                            xField: 'phantom1'
                                        },{
                                            xField: 'phantom2'
                                        },{
                                            xField: 'provider',
                                            displayName: bundle.getMsg('contract.field.provider')
                                        }]
                                    }
                                },new Ext.grid.GridPanel({
                                    store: this.contractfinishStore,
                                    loadMask: true,
                                    stripeRows: true,
                                    autoExpandColumn: 'contractfinishedcolname',
                                    columns: [{
                                        id:'contractfinishedcolname', 
                                        header: bundle.getMsg('app.form.name'), 
                                        width: 200, 
                                        sortable: true, 
                                        dataIndex: 'name'
                                    },{
                                        header: bundle.getMsg('contract.field.client'), 
                                        width: 60, 
                                        sortable: true, 
                                        align: 'center',
                                        dataIndex: 'client',
                                        renderer: function(value, metaData, record) {
                                            if(value > 0)
                                                return '<a href="#" onclick="javascript:App.printView(&#39;/contract/report/id/dateclient/entityid/'+config.app_entityid+
                                                '/date/end'+
                                                '/month/'+record.get('id')+
                                                '/title/'+bundle.getMsg('contract.chart.finish')+' ['+record.get('name')+']&#39;, &#39; &#39;, &#39; &#39;);" style="text-decoration: none;">'+value+'</a>';
                                            return value;
                                        }
                                    },{
                                        header: bundle.getMsg('contract.field.provider'), 
                                        width: 60, 
                                        sortable: true, 
                                        align: 'center',
                                        dataIndex: 'provider',
                                        renderer: function(value, metaData, record) {
                                            if(value > 0)
                                                return '<a href="#" onclick="javascript:App.printView(&#39;/contract/report/id/dateprovider/entityid/'+config.app_entityid+
                                                '/date/end'+
                                                '/month/'+record.get('id')+
                                                '/title/'+bundle.getMsg('contract.chart.finish')+' ['+record.get('name')+']&#39;, &#39; &#39;, &#39; &#39;);" style="text-decoration: none;">'+value+'</a>';
                                            return value;
                                        }
                                    }]
                                })]
                            }]
                        },{
                            region:'east',
                            margins: '5 5 5 0',
                            width: 450,
                            minSize: 350,
                            maxSize: 750,
                            layout: 'border',
                            defaults: {
                                split: true
                            },
                            items: [{
                                region:'center',
                                title: bundle.getMsg('contract.chart.reclamationtype'),
                                defaults: {
                                    border: false
                                },
                                layout:'card',
                                activeItem: 0,
                                tools: [{
                                    id:'right',
                                    qtip: bundle.getMsg('app.form.longcomment'),
                                    handler: window['EntitymanagerApp'].flipCardData
                                },{
                                    id:'refresh',
                                    qtip: bundle.getMsg('app.languaje.refresh.label'),
                                    handler: function(){
                                        window['EntitymanagerApp'].loadContractbyReclamationTypeData();
                                    }
                                },{
                                    id:'print',
                                    qtip: bundle.getMsg('app.languaje.report.printview'),
                                    handler: function(){
                                        App.printView('/contract/graph/title/contract.chart.reclamationtype/id/'+config.app_entityid, ' ', ' ');
                                    }
                                }],
                                items: [{
                                    items: {
                                        xtype: 'stackedbarchart',
                                        store: this.contractbyreclamationtypeStore,
                                        yField: 'name',
                                        xAxis: new Ext.chart.NumericAxis({
                                            stackingEnabled: true
                                        }),
                                        series: [{
                                            xField: 'client',
                                            displayName: bundle.getMsg('contract.field.client')
                                        },{
                                            xField: 'phantom1'
                                        },{
                                            xField: 'phantom2'
                                        },{
                                            xField: 'provider',
                                            displayName: bundle.getMsg('contract.field.provider')
                                        }]
                                    }
                                },new Ext.grid.GridPanel({
                                    store: this.contractbyreclamationtypeStore,
                                    loadMask: true,
                                    stripeRows: true,
                                    autoExpandColumn: 'contractreclamationtypecolname',
                                    columns: [{
                                        id:'contractreclamationtypecolname', 
                                        header: bundle.getMsg('app.form.name'), 
                                        width: 200, 
                                        sortable: true, 
                                        dataIndex: 'name'
                                    },{
                                        header: bundle.getMsg('contract.field.client'), 
                                        width: 60, 
                                        sortable: true, 
                                        align: 'center',
                                        dataIndex: 'client',
                                        renderer: function(value, metaData, record) {
                                            if(value > 0)
                                                return '<a href="#" onclick="javascript:App.printView(&#39;/contract/report/id/reclamationtypeclient/entityid/'+config.app_entityid+
                                                '/entitytypeid/'+record.get('id')+
                                                '/title/'+bundle.getMsg('contract.chart.reclamationtype')+' ['+record.get('name')+']&#39;, &#39; &#39;, &#39; &#39;);" style="text-decoration: none;">'+value+'</a>';
                                            return value;
                                        }
                                    },{
                                        header: bundle.getMsg('contract.field.provider'), 
                                        width: 60, 
                                        sortable: true, 
                                        align: 'center',
                                        dataIndex: 'provider',
                                        renderer: function(value, metaData, record) {
                                            if(value > 0)
                                                return '<a href="#" onclick="javascript:App.printView(&#39;/contract/report/id/reclamationtypeprovider/entityid/'+config.app_entityid+
                                                '/entitytypeid/'+record.get('id')+
                                                '/title/'+bundle.getMsg('contract.chart.reclamationtype')+' ['+record.get('name')+']&#39;, &#39; &#39;, &#39; &#39;);" style="text-decoration: none;">'+value+'</a>';
                                            return value;
                                        }
                                    }]
                                })]
                            }]
                        }]
                    },{
                        title: bundle.getMsg('entity.field.opinion'),
                        iconCls: Ext.ux.Icon('comments'),
                        border: false,
                        layout: 'fit',
                        items:[this.opinionsPanel]
                    }]
                })]
            });
        },
        
        loadContractbyReclamationTypeData : function(){
            window['EntitymanagerApp'].contractbyreclamationtypeStore.removeAll();
            window['EntitymanagerApp'].contractbyreclamationtypeStore.load({
                params: {
                    component: 'stadistic',
                    type: 'byreclamationtype'
                }
            });
        },
        loadContractbyDateData : function(){
            window['EntitymanagerApp'].contractbydateStore.removeAll();
            window['EntitymanagerApp'].contractbydateStore.load({
                params: {
                    component: 'stadistic',
                    type: 'bydate'
                }
            });
        },
        loadContractAprovedData : function(){
            window['EntitymanagerApp'].contractaprovedStore.removeAll();
            window['EntitymanagerApp'].contractaprovedStore.load({
                params: {
                    component: 'stadistic',
                    type: 'aproved'
                }
            });
        },
        loadContractFinishData : function(){
            window['EntitymanagerApp'].contractfinishStore.removeAll();
            window['EntitymanagerApp'].contractfinishStore.load({
                params: {
                    component: 'stadistic',
                    type: 'finish'
                }
            });
        },
        loadContractEntitytypeData : function(){
            window['EntitymanagerApp'].contractentitytypeStore.removeAll();
            window['EntitymanagerApp'].contractentitytypeStore.load({
                params: {
                    component: 'stadistic',
                    type: 'entitytype'
                }
            });
        },
        
        flipCardData : function(a,b,c){
            if(!c.activeItem)
                c.activeItem = 0;
                                        
            c.activeItem++;
                                        
            if(c.activeItem >= c.items.items.length)
                c.activeItem = 0;
                                        
            c.getLayout().setActiveItem(c.activeItem);
        },
        
        showWindow : function(){},
        
        applySecurity : function(groups, permissions){}
    }
}();

