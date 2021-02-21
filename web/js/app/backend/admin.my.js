

App = function() {
    return {
        init : function(App) {
            // setting up custom form utils
            Ext.apply(Ext.form.VTypes, {
                daterange : function(val, field) {
                    var date = field.parseDate(val);

                    if(!date){
                        return false;
                    }
                    if (field.startDateField) {
                        var start = Ext.getCmp(field.startDateField);
                        if (!start.maxValue || (date.getTime() != start.maxValue.getTime())) {
                            start.setMaxValue(date);
                            start.validate();
                        }
                    }
                    else if (field.endDateField) {
                        var end = Ext.getCmp(field.endDateField);
                        if (!end.minValue || (date.getTime() != end.minValue.getTime())) {
                            end.setMinValue(date);
                            end.validate();
                        }
                    }
                    return true;
                },
	
                password: function(val, field) {
                    if (field.initialPassField) {
                        var pwd = Ext.getCmp(field.initialPassField);
                        return (val == pwd.getValue());
                    }
                    return true;
                },
                passwordText: bundle.getMsg('app.error.nomatchingpasswords')
            });

            // initializing generic components
            filesDataView = new Ext.DataView({
                tpl: new Ext.XTemplate(
                    '<tpl for=".">',
                    '<div class="thumb-wrap">',
                    '<div class="thumb"><img id="{id}" src="{url}" title="{name}"></div>',
                    '<div style="text-align:center;">{shortname}</div>',
                    '</div>',
                    '</tpl>'
                    ),
                singleSelect: true,
                trackOver: true,
                overClass:'x-view-over',
                itemSelector: 'div.thumb-wrap',
                emptyText : '<div style="padding:10px;">'+bundle.getMsg('app.error.noimages')+'</div>',
                store: new Ext.data.Store({
                    reader: new Ext.data.JsonReader()
                }),
                prepareData: function(data){
                    data.href = data.url;

                    var extension = data.url;
                    while(extension && extension.indexOf('.')>-1)
                        extension = extension.substring(extension.indexOf('.')+1, extension.length);

                    if(extension)
                        switch(extension.toLowerCase()){
                            case 'jpg':
                            case 'jpeg':
                            case 'png':
                                break;
                            default:
                                data.url = config.app_host+'/images/generic-file.png';
                                break;
                        }

                    data.shortname = '';
                    if(data.name && data.name != '')
                        data.shortname = Ext.util.Format.ellipsis(data.name, 15);
                    
                    data.id = hex_md5(this.id+'-'+data.href);
                    
                    return data;
                },
                listeners: {
                    dblclick: function(dataView) {
                        var record = dataView.getSelectedRecords();
                        if(record && record.length>0)
                            record = record[0];
                        else 
                            record = false;

                        if(record){
                            var extension = record.get('href');
                            while(extension.indexOf('.')>-1)
                                extension = extension.substring(extension.indexOf('.')+1, extension.length);

                            switch(extension.toLowerCase()){
                                case 'jpg':
                                case 'jpeg':
                                case 'png':
                                    App.exploreFile(record.get('href'));
                                    break;
                                default:
                                    var win = window.open(record.get('href'), '_blank');
                                    win.focus();
                                    break;
                            }
                        }
                    }
                }
            });
            documentUploadFormPanel = new Ext.FormPanel({
                frame: true,
                border: false,
                bodyStyle: 'padding:5px',
                labelWidth: 5,
                layout: 'column',
                url: config.app_host + '/file/request/method/upload',
                method: 'POST',
                fileUpload: true,
                items: [{
                    columnWidth: .9,
                    layout: 'form',
                    labelAlign:'top',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: '',
                        labelSeparator: '',
                        name: 'picture',
                        id:'picture',
                        msgTarget: 'under',
                        regexText: '',
                        inputType: 'file',
                        allowBlank: false
                    }]
                }]
            });
            rowEditor = new Ext.ux.grid.RowEditor({
                saveText: bundle.getMsg('app.form.update'),
                cancelText: bundle.getMsg('app.form.cancel'),
                commitChangesText: bundle.getMsg('app.error.commitneeded'),
                errorText: bundle.getMsg('app.msg.error.title'),
                clicksToEdit: 2
            });

            // setting general layout items

            this.mask = new Ext.LoadMask(Ext.getBody(), {
                msg: bundle.getMsg('app.layout.loading')+'...'
            });

            this.statisticsStore = new Ext.data.Store({
                url: config.app_host + '/task/request/method/load',
                baseParams:{
                    component: 'summary',
                    id: config.app_logueduserdata.personid
                },
                reader: new Ext.data.JsonReader(),
                listeners: {
                    beforeload: function() { 
                        App.messageContent = App.messagePanel.body.dom.innerHTML;
                    },
                    load: function(store, records, options) { 
                        if(store.loadforced || App.messagePanel.body.dom.innerHTML != App.messageContent)
                            App.messagePanel.body.highlight('#FFFF66', {
                                block:true
                            });
                        if(App.messagePanel.body.dom.innerHTML.indexOf('<i class="ext-cal-ic ext-cal-ic-rem">')>-1){
                            Ext.Base.msg(bundle.getMsg('reminder.field.label'), '', 4, true); 
                            
                            var record = false;
                            var i = 0;
                            
                            for(i = 0; i < records.length; i++)
                                if(records[i].id == 'task.reminder.title'){
                                    record = records[i];
                                    break;
                                }
                            
                            if(record){
                                var msg = ''; 
                                var header = String.format(bundle.getMsg('task.reminder.show')+':', record.json.data.length>1 ? 's' : '', record.json.data.length > 1 ? 'n' : '');
                                for(i = 0; i < record.json.data.length && i < 5; i++){
                                    var dt = Date.parseDate(record.json.data[i].Event.start, Date.patterns.ISO8601Long);
                                    if(msg == '')
                                        msg = String.format(bundle.getMsg('task.reminder.show.detail'), i+1, record.json.data[i].Event.name, record.json.data[i].Creator.sfGuardUser.first_name + ' ' +record.json.data[i].Creator.sfGuardUser.last_name, dt.format(Date.patterns.NonISO8601Long1));
                                    else
                                        msg = msg + '<br/>'+String.format(bundle.getMsg('task.reminder.show.detail'), i+1, record.json.data[i].Event.name, record.json.data[i].Creator.sfGuardUser.first_name + ' ' +record.json.data[i].Creator.sfGuardUser.last_name, dt.format(Date.patterns.NonISO8601Long1));
         
                                    
                                }
                                Ext.Msg.show({
                                    title: bundle.getMsg('app.msg.info.title'),
                                    msg: header+'<hr/><code>'+msg+'</code>',
                                    buttons: Ext.Msg.OK,
                                    fn: function(btn, text){
                                        
                                    },
                                    icon: Ext.MessageBox.INFO
                                });
                        
                            }
                        }
                        
                        store.loadforced = false;
                    }
                }
            });

            this.aboutPanel = new Ext.Panel({
                layout:'table',
                layoutConfig: {
                    columns: 2
                },
                defaults: {
                    border: false,
                    bodyStyle: 'padding:15px'
                },
                items: [{
                    colspan: 2,
                    html: String.format(bundle.getMsg('app.languaje.aboutgeneral.label'), 
                        '', 
                        '<img src="'+base64logo+'" height="50" align="left"/>', 
                        '', 
                        '<span><b>', 
                        '</b></span>')
                },{
                    width: 300,
                    html: String.format(bundle.getMsg('app.languaje.aboutauthor.label'), 
                        '<h2>', '</h2>', '<hr/>', '<br/>', '<p>', '<b>', '</b>', 
                        '</p>', '<ul>', '<li>', '</li>', ((new Date()).format('Y') - 2008), '</ul>')
                },{
                    width: 300,
                    html: String.format(bundle.getMsg('app.languaje.aboutsoftware.label'), 
                        '<h2>', '</h2>', '<hr/>', '<br/>', '<p>', '<b>', '</b>', '</p>', config.app_validation.expirationdate?config.app_validation.expirationdate:'')
                }]
            });
            
            var entitys = new Array();
            entitys.push({
                text: bundle.getMsg('entity.field.none'),
                iconCls: Ext.ux.Icon('chart_organisation'),
                checked: true
            });
            for(var i = 0; config.app_entitys && i < config.app_entitys.length; i++)
                entitys.push({
                    def: config.app_entitys[i],
                    text: config.app_entitys[i].name,
                    iconCls: Ext.ux.Icon('chart_organisation'),
                    checked: false
                });
            this.entityCycleButton = new Ext.CycleButton({
                hidden: !config.multientityapp,
                showText: true,
                items: entitys,
                changeHandler:function(btn, item){
                    Ext.get('customheader').dom.innerHTML = '<h1>' + config.app_name + '</h1>';
                    if(item.def){
                        config.app_entity = item.def.name;
                        Ext.get('customheader').dom.innerHTML = '<h1>' + config.app_name + ': <b>' + item.def.name + '</b></h1>';
                        
                        config.app_multientity = item.def;
                    }
                    config.app_entityid = item.def && item.def.id != '' ? item.def.id : '';
                    if(config.app_ismultientidable == 2)
                        config.app_entityid = config.app_multientityid;
                    
                    App.mainmenuTreePanel.getRootNode().cascade(function(node){
                        var menu = Ext.getCmp('principal-menu-item-'+node.id);
                        if(item.text == bundle.getMsg('entity.field.none')){
                            if(node.attributes.is_multientidable){
                                node.getUI().hide();
                                if(menu)
                                    menu.hide();
                            }
                            else{
                                node.getUI().show();
                                if(menu)
                                    menu.show();
                            }
                                
                        }
                        else{
                            if(node.attributes.is_multientidable){
                                node.getUI().show(); 
                                if(menu)
                                    menu.show();
                            }
                            else{
                                if(node.id != App.mainmenuTreePanel.getRootNode().id){
                                    node.getUI().hide();
                                    if(menu)
                                        menu.hide();
                                }
                            }
                        }
                    });
                    
                    App.evalMenu();
                    
                    var menu = Ext.getCmp('principal-menu-item-home');
                    if(getModule(App.centerPanel.getLayout().activeItem.id.replace('gridPanel', '')).is_multientidable){
                        if(!config.app_entityid || config.app_entityid == '' || config.app_entityid == '*'){
                            if(menu)
                                menu.toggle(true);
                        }
                        else{
                            if(App.centerPanel.getLayout().activeItem.store)
                                App.centerPanel.getLayout().activeItem.store.baseParams.entityid = config.app_entityid;
                            if(App.centerPanel.getLayout().activeItem.loader)
                                App.centerPanel.getLayout().activeItem.loader.baseParams.entityid = config.app_entityid;
                            
                            switch(App.centerPanel.getLayout().activeItem.getXType()){
                                case 'treegrid':
                                    App.centerPanel.getLayout().activeItem.getBottomToolbar().doRefresh();
                                    break;
                                default:
                                    App.centerPanel.getLayout().activeItem.fireEvent('activate', App.centerPanel.getLayout().activeItem);
                                    break;
                            }
                        }
                    }
                    else{
                        if(menu && App.entityCycleButton.getActiveItem().text != bundle.getMsg('entity.field.none'))
                            menu.toggle(true);
                    }
                }
            });
            

            this.topToolbar = new Ext.Toolbar({
                items: ['->', {
                    id: 'principal-menu-item-home',
                    disabled: true,
                    enableToggle: true,
                    pressed: true,
                    toggleGroup: 'principal-menu-togglegroup',
                    iconCls: Ext.ux.Icon('house'),
                    toggleHandler: function(button, pressed) {
                        if(pressed){
                            button.disable();

                            App.mainmenuTreePanel.getSelectionModel().clearSelections();
                            App.centerPanel.getLayout().setActiveItem(0); 
                        }
                        else
                            button.enable();
                    }
                },'-', new Ext.Toolbar.TextItem({
                    hidden: !config.multientityapp,
                    text: bundle.getMsg('entity.field.label')+':'
                }), this.entityCycleButton, {
                    hidden: !config.multientityapp,
                    xtype: 'tbseparator'
                }, bundle.getMsg('user.field.label')+':',{
                    text: Ext.util.Format.capitalize(config.app_logueduserdata.username),
                    iconCls: Ext.ux.Icon('user_suit'),
                    menu : {
                        items: [{
                            id: 'editProfileBtn',
                            text: bundle.getMsg('user.profile'),
                            iconCls: Ext.ux.Icon('award_star_bronze_3'),
                            listeners: {
                                click: function() {
                                    App.mask.show();
                                    if (config.app_logueduserdata){
                                        window['UserApp'].formPanelEditProfile.firstnameField.setValue(config.app_logueduserdata.first_name);
                                        window['UserApp'].formPanelEditProfile.lastnameField.setValue(config.app_logueduserdata.last_name);
                                        window['UserApp'].formPanelEditProfile.emailField.setValue(config.app_logueduserdata.email_address);
                                        
                                        window['UserApp'].contactPanel.getStore().removeAll();
                                        if(config.app_logueduserdata.Person && config.app_logueduserdata.Person.profile && config.app_logueduserdata.Person.profile!=''){
                                            var profile = Ext.decode(config.app_logueduserdata.Person.profile);
                                            for (var i = 0; profile && profile.contacts && i < profile.contacts.length; i++)
                                                window['UserApp'].contactPanel.getStore().insert(window['UserApp'].contactPanel.getStore().getCount(), new Ext.data.Record(profile.contacts[i]));
                                            window['UserApp'].contactPanel.reconfigure(window['UserApp'].contactPanel.getStore(), window['UserApp'].contactPanel.getColumnModel());
                                        }

                                        var completeForm = function(){
                                            if(document.getElementById('userprofilepicture')){
                                                document.getElementById('userprofilepicture').src = config.app_logueduserdata.picture?config.app_logueduserdata.picture:config.app_host+'/images/avatar.png';
                                                document.getElementById('userprofilepicture').title = config.app_logueduserdata.shortname;                                                
                                            }
                                        };
                                        Ext.defer(completeForm, 500, this);
                                    }

                                    window['UserApp'].showEditProfileWindow(Ext.getBody());
                                    App.mask.hide();
                                }
                            }
                        },{
                            iconCls: Ext.ux.Icon('key'),
                            text: bundle.getMsg('user.password.window.title'),
                            listeners: {
                                click: function(button) {
                                    window['UserApp'].formPanelChangePassword.usernameField.setValue(config.app_logueduserdata.username);
                                    window['UserApp'].showChangePasswordWindow(button.getEl(), 240);
                                }
                            }
                        },'-',{
                            iconCls: Ext.ux.Icon('door_in'),
                            text: bundle.getMsg('app.layout.topbar.usermenu.closesesion'),
                            listeners: {
                                click: function() {
                                    window.location.href = config.app_host + '/logout.php';
                                }
                            }
                        }]
                    }
                }, '-', bundle.getMsg('app.layout.topbar.languajeselector.label')+':', 
                new Ext.ux.LanguageCycleButton({
                    id: 'LanguageCycleButton',			 
                    languageItems:[{
                        id: 'es-Es', 
                        language: 'es-Es', 
                        charset: 'utf-8', 
                        text: bundle.getMsg('app.layout.topbar.languajeselector.item.spanish'), 
                        checked: true, 
                        iconCls: Ext.ux.Icon('flag_es')
                    //                    },{
                    //                        id: 'en-En', 
                    //                        language: 'en-En', 
                    //                        charset: 'ascii', 
                    //                        text: bundle.getMsg('app.layout.topbar.languajeselector.item.english'), 
                    //                        iconCls: Ext.ux.Icon('flag_gb')
                    }],
                    changeHandler: function(o, i){
                        if(i.id != config.app_logueduserdata.profile.languaje){
                            App.mask.msg = 'Guardando perfil';
                            App.mask.show();
                            new Ext.data.Connection().request({
                                url: config.app_host + '/db/request/method/saveprofile',
                                params: {
                                    languaje: i.id
                                },
                                method: 'POST',
                                callback : function(options, success, response) {
                                    Ext.Msg.getDialog().on('beforehide', function() {
                                        window.parent.location = window.parent.location;
                                    }, 
                                    this, {
                                        single:true
                                    });

                                    App.mask.hide();

                                    Ext.Msg.show({
                                        title:bundle.getMsg('app.msg.info.title'),
                                        msg: bundle.getMsg('app.msg.info.savedsuccessful')+'<br/>'+bundle.getMsg('app.msg.warning.reloadpage'),
                                        buttons: Ext.Msg.OK,
                                        icon: Ext.MessageBox.WARNING
                                    });
                                }
                            }); 
                        }
                        if(Ext.state.Manager.getProvider()) {
                            Ext.state.Manager.set(this.languageVar, i.language);
                        }
                    }
                }),'-', bundle.getMsg('app.layout.topbar.themeselector.label')+':', 
                new Ext.ux.ThemeCycleButton({
                    id: 'ThemeCycleButton',
                    cssItems:[{
                        id: 'blue', 
                        file: 'xtheme-blue.css', 
                        text: bundle.getMsg('app.layout.topbar.themeselector.item.blue'), 
                        iconCls: Ext.ux.Icon('color_blue'), 
                        checked: true
                    },{
                        id: 'gray', 
                        file: 'xtheme-gray.css', 
                        text: bundle.getMsg('app.layout.topbar.themeselector.item.gray'), 
                        iconCls: Ext.ux.Icon('color_gray')
                    },{
                        id: 'slickness', 
                        file: 'xtheme-slickness.css', 
                        text: bundle.getMsg('app.layout.topbar.themeselector.item.black'), 
                        iconCls: Ext.ux.Icon('color_black')
                    }],
                    changeHandler: function(o, i){
                        if(!config.app_logueduserdata || !config.app_logueduserdata.profile || i.id != config.app_logueduserdata.profile.theme){
                            new Ext.data.Connection().request({
                                url: config.app_host + '/db/request/method/saveprofile',
                                params: {
                                    theme: i.id
                                },
                                method: 'POST',
                                callback : function(options, success, response) {

                                }
                            });
                        }

                        if(Ext.state.Manager.getProvider()) {
                            Ext.state.Manager.set(this.themeVar, i.file);
                        }
                        Ext.util.CSS.swapStyleSheet(this.themeVar, this.cssPath + i.file);
							
                        var frames = document.getElementsByTagName('iframe');
                        for (var j = 0; j < frames.length && frames[j].contentWindow.Ext; j++){
                            if (frames[j].contentWindow.document.baseURI.indexOf('calendar/')==-1)
                                frames[j].contentWindow.Ext.util.CSS.swapStyleSheet(this.themeVar, this.cssPath + i.file);
                            else
                                frames[j].contentWindow.Ext.util.CSS.swapStyleSheet(this.themeVar, '../'+this.cssPath + i.file);
                        }
                    }
                }),{
                    text: bundle.getMsg('app.layout.help'),
                    iconCls: Ext.ux.Icon('help'),
                    menu : {
                        items: [{
                            iconCls: Ext.ux.Icon('book_open'),   
                            text: bundle.getMsg('app.layout.manual'),
                            href: config.app_host+'/uploads/docs/usermanual.pdf',
                            hrefTarget: '_blank'
                        },'-',{
                            text: bundle.getMsg('app.layout.about')+'...',
                            iconCls: Ext.ux.Icon('zentro', 'myicons'),
                            listeners: {
                                click: function(button, eventObject) {
                                    App.window = App.showWindow(bundle.getMsg('app.layout.about')+'...', 620, 370, App.aboutPanel, 
                                        false,
                                        function(){
                                            App.window.hide();
                                        },
                                        Ext.getBody(),
                                        false,
                                        false,
                                        false,
                                        true); 
                                }
                            }
                        }]
                    }
                }]
            });

            this.northPabel = new Ext.Panel({
                region: 'north',
                minSize: 55,
                maxSize: 55,
                height: 55,
                collapsible: true,
                collapseMode: 'mini',
                header: false,
                border: false,
                html: '<div id="customheader"><h1>'+config.app_banner+'</h1></div>',
                bbar: this.topToolbar
            }); 


            this.mainmenuTreePanel = new Ext.tree.TreePanel({
                autoScroll: true, 
                title: bundle.getMsg('app.layout.principalmenu'),
                iconCls: Ext.ux.Icon('expand-all', 'myicons'),
                rootVisible: false,
                border: false,
                lines: true,
                //singleExpand: true,
                useArrows: false,
                flex: 1,
                tools: [{
                    id:'refresh',
                    hidden: true,
                    qtip: bundle.getMsg('app.languaje.refresh.label'),
                    handler: function(event, toolEl, panel, tc){
                        App.mainmenuTreePanel.getLoader().load(App.mainmenuTreePanel.getRootNode());
                    }
                }],
                loader: new Ext.tree.TreeLoader({
                    dataUrl: config.app_host + '/module/request/method/load',
                    baseParams:{
                        component: 'completetree'
                    },    
                    listeners: {
                        beforeload: function(treeLoader, node, response){
                            App.mask.show();
                            App.entityCycleButton.setDisabled(true);
                        },
                        load: function(treeLoader, node, response){
                            if(response.responseText.indexOf('signinForm')>0)
                                showSesionExpiredMsg();
                            
                            var getMenuItems = function(data){
                                var items = new Array();
                                for (var i = 0; i < data.length; i++) {
                                    modules.push(data[i]); // this line is important to init modules. do not delete
                                    if(data[i].is_active){
                                        var item = {
                                            hidden: config.multientityapp && data[i].is_multientidable && App.entityCycleButton.getActiveItem().text == bundle.getMsg('entity.field.none'),
                                            id: 'principal-menu-item-'+data[i].id,
                                            //text: data[i].name,
                                            tooltip: {
                                                title: bundle.getMsg(data[i].nick.toLowerCase()+'.tab.label') == 'assetexplorer.tab.label.undefined' ? data[i].name : bundle.getMsg(data[i].nick.toLowerCase()+'.tab.label'),
                                                text: data[i].comment
                                            },
                                            iconCls: Ext.ux.Icon(data[i].customicon.replace('.png', '')),
                                            def: data[i],
                                            enableToggle: true,
                                            pressed: false,
                                            toggleGroup: 'principal-menu-togglegroup',
                                            toggleHandler: function(button, pressed) {
                                                if(pressed){
                                                    button.disable();

                                                    var customnode = new Object;
                                                    customnode.name = button.def.name;
                                                    customnode.text = button.def.text;
                                                    customnode.nick = button.def.nick;
                                                    customnode.comment = button.def.comment;
                                                    customnode.customicon = button.def.customicon.replace('.png', '');

                                                    customnode.attributes = new Object;
                                                    customnode.attributes.dependencies = button.def.dependencies;

                                                    activateContainer(customnode, Ext.getCmp('centerPanel'), true);

                                                    var newnode = App.mainmenuTreePanel.getNodeById(button.def.id);
                                                    if(newnode)
                                                        App.mainmenuTreePanel.getSelectionModel().select(newnode);
                                                }
                                                else
                                                    button.enable();
                                            }

                                        };
                                        /*
                                        if (data[i].children && data[i].children.length > 0) {
                                            item.xtype = 'splitbutton';
                                            item.menu = new Ext.menu.Menu();
                                            item.menu.add(getMenuItems(data[i].children));
                                        }
                                        */
                                        items.push(item);
                                        
                                        if(data[i].nick == 'User'){
                                            var customnode = data[i];
                                            customnode.customicon = data[i].customicon.replace('.png', '');
                                            customnode.attributes = new Object;
                                            customnode.attributes.dependencies = data[i].dependencies;
                                            activateContainer(customnode, Ext.getCmp('centerPanel'));
                                        }
                                    }

                                }
                                return items;
                            };
                            
                            var items = getMenuItems(Ext.decode(response.responseText));
                            for (var i = 0; i < items.length; i++) 
                                App.topToolbar.insert(i, items[i]);

                            App.prepareNode(node);
                            App.viewPort.doLayout();
                            
                            App.entityCycleButton.setDisabled(false);
                            App.mask.hide();
                        }
                    }
                }),
                root: new Ext.tree.AsyncTreeNode({
                    id: 'NULL',
                    text: bundle.getMsg('app.layout.controlpanel'),
                    iconCls: Ext.ux.Icon('house'),
                    expanded: true
                }),
                listeners: {
                    click: function(node, eventObject){
                        var menu = Ext.getCmp('principal-menu-item-'+node.id);
                        if(menu)
                            menu.toggle(true);

                    }
                }
            });

            //            this.messagePanel = new Ext.Panel({
            //                title: bundle.getMsg('notification.tab.label'),
            //                iconCls: Ext.ux.Icon('emesene'),
            //                autoScroll: true,
            //                border: false,
            //                height: 130,
            //                tools: [{
            //                    id:'refresh',
            //                    qtip: bundle.getMsg('app.languaje.refresh.label'),
            //                    handler: function(){
            //                        App.statisticsStore.load();
            //                    }
            //                }],
            //                items: [new Ext.DataView(Ext.apply({
            //                    store: App.statisticsStore,
            //                    prepareData: function(data){
            //                        data.size = 11;
            //                        data.bundlename = bundle.getMsg(data.name);
            //                    
            //                        return data;
            //                    },
            //                    listeners: {
            //                        render: function(dv) {
            //                            App.statisticsStore.load();
            //                        }
            //                    }
            //                 
            //                }, {
            //                    tpl: '<tpl for=".">' +
            //                    '<table width="100%">' +
            //                    '<tr style="font-size:{size}px;">' +
            //                    '<td width="1%">&nbsp;</td>' +
            //                    '<td width="9%"><img src="../images/icons/famfamfam/{flag}.png" width="13px" /></td>' +
            //                    '<td width="75%"><span>{bundlename}:</span></td>' +
            //                    '<td width="15%"><span><div align="center"><b>(<a href="#" onclick="javascript:App.setView(&#39;{name}&#39;)" style="text-decoration: none;">{amount}</a>)</b></div></span></td>' +
            //                    '</tr>' +
            //                    '</table>' +
            //                    '</tpl>',
            //                    selectedClass: 'item-selected',
            //                    cls: 'item-view',
            //                    overClass: 'item-over',
            //                    itemSelector: 'div.item-source',
            //                    singleSelect: true,
            //                    multiSelect: false
            //                }))]
            //                
            //            });

            this.westPanel = new Ext.Panel({
                region:'west',
                collapsible: true,
                collapsed: true,
                collapseMode: 'mini',
                header: false,
                split: true,
                width: 210,
                minSize: 210,
                maxSize: 210,
                layout:'border',
                items: [new Ext.Panel({
                    region:'center',
                    autoScroll: true, 
                    title: bundle.getMsg('user.profile'),
                    iconCls: Ext.ux.Icon('user_suit'),
                    split: true,
                    border: false,
                    layout:'vbox',
                    layoutConfig: {
                        align : 'stretch',
                        pack: 'start'
                    }, 
                    tools: [{
                        id:'gear',
                        qtip: bundle.getMsg('user.profile.edit')+'...',
                        handler: function(){
                            Ext.getCmp('editProfileBtn').fireEvent('click',Ext.getCmp('editProfileBtn'));
                        }
                    }],
                    width: 210,
                    minSize: 210,
                    maxSize: 210,
                    items:[new Ext.Panel({
                        height: 75,
                        border: false,
                        listeners: {
                            render: {
                                fn: function(p){
                                    var tpl = new Ext.Template(
                                        '<div class="whoInfo"><div class="whoAvatar">',
                                        '<img id="profileimage" src="{imageurl}" width="64px" height="64px" />',
                                        '</div>',
                                        '<div class="whoUser">',
                                        '<b>{role}</b><hr/>',
                                        '</div>',
                                        '<div class="whoMail">',
                                        '<b>{shortname}</b>',
                                        '</div>',
                                        '<div class="whoMail">',
                                        '<a href="mailto:{email_address}" style="text-decoration: none;">{shortemailaddress}</a>',
                                        '</div></div>'
                                        ); 
                                    var data = '';

                                    if(config.app_logueduserdata){
                                        data = config.app_logueduserdata;

                                        data.role = '';
                                        for(var i = 0; i < config.app_logueduserdata.Groups.length; i++){
                                            if (i>0)
                                                data.role += ', ' +config.app_logueduserdata.Groups[i].description;
                                            else
                                                data.role = config.app_logueduserdata.Groups[i].description;
                                        }
                                        data.role = Ext.util.Format.ellipsis(data.role, config.app_logueduserdata.Groups.length > 1 ? 16 : 20);

                                        data.shortname = Ext.util.Format.ellipsis(data.first_name+' '+data.last_name, 25);
                                        
                                        data.shortemailaddress = '';
                                        if(data.email_address && data.email_address != '')
                                            data.shortemailaddress = Ext.util.Format.ellipsis(data.email_address, 28);

                                        data.imageurl = config.app_logueduserdata.picture?config.app_logueduserdata.picture:config.app_host+'/images/avatar.png';
                                    }

                                    tpl.overwrite(p.body, data);
                                }
                            }
                        }
                    }),this.mainmenuTreePanel]// , this.messagePanel]
                }),{
                    border: false,
                    header: false,
                    region: 'south',
                    collapsible: true,
                    collapsed: true, 
                    split: true, 
                    collapseMode: 'mini',
                    height: 70,
                    minSize: 70,
                    maxSize: 70,
                    html: '<div style="text-align:center;"><img src="'+base64logo+'" width=150 title="'+config.app_name+'"/></div>'
                }]
            });

            this.centerPanel = new Ext.Panel({
                id:'centerPanel',
                layout:'card',
                activeItem: 0,
                region: 'center',
                border: false,
                items:[new Ext.Panel({
                    region:'center',
                    layout: 'fit', 
                    padding: '5',
                    autoScroll: true, 
                    autoLoad:'welcome.html'
                })]
            });

            this.adminPanel = new Ext.Panel({
                layout:'border',
                border: false,
                items: [this.westPanel, this.centerPanel]
            });

            this.contentPanel = {
                id: 'contentPanel',
                region:'center',
                margins: '0 0 0 0',
                border: false,
                defaults: {
                    border: false
                },
                layout: 'card',
                activeItem: 0,
                items: [this.adminPanel]
            };
			
            this.viewPort = new Ext.Viewport({
                layout:'border',
                defaults: {
                    split: true
                },
                items: [this.northPabel, this.contentPanel]
            });
        },
		
        selectionChange : function(selectionModel) {
            var obj = new Object;
            // grid based interfaces
            if(selectionModel.grid){
                var records = selectionModel.getSelections();
                obj.deleteable = true;
                for (var i=0; i<records.length; i++)
                    if (!records[i].get('deleteable'))
                        obj.deleteable = false;
            
                if(selectionModel.grid.removeBtn)
                    selectionModel.grid.removeBtn.setDisabled(!obj.deleteable || selectionModel.getCount() < 1);
                if(selectionModel.grid.updateBtn)
                    selectionModel.grid.updateBtn.setDisabled(selectionModel.getCount() != 1);
            }
            // tree based interfaces
            if(selectionModel.tree){
                obj.deleteable = true;
                obj.expandable = false;
                obj.allleaf = true;
                
                if(selectionModel.selNode){
                    if (!selectionModel.selNode.attributes || !selectionModel.selNode.attributes.deleteable || selectionModel.selNode.attributes.deleteable == 0)
                        obj.deleteable = false;
                    if (!selectionModel.selNode.isExpanded() && !selectionModel.selNode.isLeaf())
                        obj.expandable = true;
                    if (!selectionModel.selNode.isLeaf())
                        obj.allleaf = false;
                }
                if(selectionModel.selNodes)
                    for (i = 0; i < selectionModel.selNodes.length; i++){
                        if (!selectionModel.selNodes[i].attributes || !selectionModel.selNodes[i].attributes.deleteable || selectionModel.selNodes[i].attributes.deleteable == 0)
                            obj.deleteable = false;
                        if (!selectionModel.selNodes[i].isExpanded() && !selectionModel.selNodes[i].isLeaf())
                            obj.expandable = true;
                        if (!selectionModel.selNodes[i].isLeaf())
                            obj.allleaf = false;                                
                    }
                
                if(selectionModel.tree.updateBtn)
                    selectionModel.tree.updateBtn.setDisabled(selectionModel.selNodes.length != 1);
                if(selectionModel.tree.removeBtn)
                    selectionModel.tree.removeBtn.setDisabled(!obj.deleteable || selectionModel.selNodes.length < 1);
                            
                if(!selectionModel.selNode && !selectionModel.selNodes){
                    obj.expandable = false;
                    var nodes = selectionModel.tree.getRootNode().childNodes;
                    for (i = 0; i < nodes.length; i++)
                        if (!nodes[i].isExpanded())
                            obj.expandable = true;
                }
                if(selectionModel.tree.expandBtn)
                    selectionModel.tree.expandBtn.setDisabled(obj.allleaf || !obj.expandable);
                if(selectionModel.tree.collapseBtn)
                    selectionModel.tree.collapseBtn.setDisabled(obj.allleaf || obj.expandable);
            }

            return obj;
        },
		
        isAdvanced : function(){
            //return App.groups && App.groups.indexOf('advanced') != -1;
            return App.groups && App.groups.indexOf('advanced') != -1 || App.isAdmin();
        },
		
        isAdmin : function(){
            return App.groups && App.groups.indexOf('admin') != -1;
        },
		
        isSuperAdmin : function(){
            return App.isAdmin();
        },
		
        evalMenu : function(){
            var amount = 0;
            for(var i = 0; i < App.mainmenuTreePanel.getRootNode().childNodes.length; i++){
                var node = App.mainmenuTreePanel.getRootNode().childNodes[i];
                if(node.getUI().getEl().style.display == 'none')
                    amount++;
            }
            if(amount == App.mainmenuTreePanel.getRootNode().childNodes.length)
                App.westPanel.collapse();
            else
                App.westPanel.expand();
        },

        prepareNode : function(parentNode){
            for(var i = 0; i < parentNode.childNodes.length; i++){
                var node = parentNode.childNodes[i];
                node.setIconCls(Ext.ux.Icon(node.attributes.customicon.replace('.png', '')));
                node.setText(node.attributes.name);
                
                if(config.multientityapp && node.attributes.is_multientidable && App.entityCycleButton.getActiveItem().text == bundle.getMsg('entity.field.none'))
                    node.getUI().hide();
                else
                    node.getUI().show();

                if(node.childNodes && node.childNodes.length>0)
                    App.prepareNode(node);
            }
            
            App.evalMenu();
        },
		
        getFiltersText : function(panel){
            var str = '';
            var updateStr = function(colname, val){
                if(str != '')
                    str = str + ', <b>'+colname+'</b>: '+ val;
                else
                    str = '<b>'+colname+'</b>: '+ val;
            };
            for (var i = 0; i < panel.filters.filters.items.length; i++){
                var colname = App.getColumn(panel, panel.filters.filters.items[i].dataIndex);
                if(colname)
                    colname = colname.header;
                else
                    colname = '';
                
                var obj = panel.filters.filters.items[i].getValue();
                if(panel.filters.filters.items[i].active){
                    if(typeof obj != 'object')
                        updateStr(colname, obj);
                    if(obj.eq)
                        updateStr(colname, obj.eq);
                    if(obj.lt)
                        updateStr(colname, obj.lt);
                    if(obj.gt)
                        updateStr(colname, obj.gt);
                }
            }
            return str;
        },
        getColumn : function(panel, dataIndex){
            var i = 0;
            if(panel.colModel)
                for (i = 0; i < panel.colModel.config.length; i++)
                    if(panel.colModel.config[i].dataIndex == dataIndex)
                        return panel.colModel.config[i];
            if(panel.columns)
                for (i = 0; i < panel.columns.length; i++)
                    if(panel.columns[i].dataIndex == dataIndex)
                        return panel.columns[i];
            return false;
        },
		
        setConfig : function(languaje, theme){
            if (languaje)
                Ext.getCmp('LanguageCycleButton').setActiveItem(languaje, true);
            if (theme)
                Ext.getCmp('ThemeCycleButton').setActiveItem(theme, true);
        },
		
        getLanguaje : function(splited){
            var languaje = config.app_defaultlanguaje;

            if(config.app_logueduserdata && config.app_logueduserdata.profile && config.app_logueduserdata.profile.languaje)
                languaje = config.app_logueduserdata.profile.languaje;

            if(splited)
                return languaje.substring(0, languaje.indexOf('-'));

            return languaje;
        },

        addFiles : function(array, panel, keepelements){
            if(!keepelements)
                panel.items.items[0].getStore().removeAll();
            for(var i = 0; i < array.length; i++){
                if(panel.getTopToolbar() && panel.getTopToolbar().filetypeCombo)
                    panel.getTopToolbar().filetypeCombo.getStore().removeAt(panel.getTopToolbar().filetypeCombo.getStore().find('name', array[i].name, 0, true, true));
                panel.items.items[0].getStore().insert(panel.items.items[0].getStore().getCount(), new Ext.data.Record({
                    url: array[i].url,
                    name: array[i].name,
                    href: array[i].href,
                    shortname: array[i].shortname
                }));
            }
        },
        getFilesPanelFor : function(entity, filetypes, icon){
            var app = Ext.util.Format.capitalize(entity.toLowerCase())+'App';
            var tbar = new Array();

            var pattern = '_';
            var panel = icon;
            while(panel.indexOf(pattern)> -1){
                panel = panel.replace(pattern, '');
            }

            if(Ext.isArray(filetypes)){
                tbar.push(new Ext.Toolbar.TextItem(bundle.getMsg('app.layout.device.file')+': '));
                tbar.push(new Ext.form.ComboBox({
                    ref: 'filetypeCombo',
                    width: 100,
                    store: new Ext.data.ArrayStore({
                        fields: ['name', 'regex'],
                        data: filetypes,
                        listeners: {
                            add: function() {
                                window[app][panel+'Panel'].getTopToolbar().filetypeCombo.setDisabled(false);
                            },
                            remove: function(store) {
                                window[app][panel+'Panel'].getTopToolbar().filetypeCombo.setDisabled(store.getCount() < 1);
                            }
                        }
                    }),
                    valueField: 'name', 
                    displayField: 'name',
                    tpl: '<tpl for="."><div class="x-combo-list-item">{name}</div></tpl>',
                    typeAhead: true,
                    mode: 'local',
                    triggerAction: 'all',
                    selectOnFocus:true,
                    emptyText: bundle.getMsg('app.form.select'),
                    allowBlank: false
                }));
            }


            tbar.push('->');
            tbar.push({
                tooltip: bundle.getMsg('app.form.addrow'),
                iconCls: Ext.ux.Icon('table_row_insert'),
                listeners: {
                    click: function() {
                        var path = 'web/uploads/assets/';
                        if(entity && entity!='')
                            path += entity+'/';
                        else
                            path += panel+'s/';

                        if(window[app].formPanel.nameField){
                            if(!window[app].formPanel.nameField.isValid()){
                                window[app].formPanel.nameField.markInvalid(bundle.getMsg('app.error.noname'));
                                return;
                            }
                            path += window[app].formPanel.nameField.getValue()+'/';
                        }

                        if(Ext.isArray(filetypes)){ // files are restricted
                            if(window[app][panel+'Panel'].getTopToolbar().filetypeCombo.isValid()){
                                var record = window[app][panel+'Panel'].getTopToolbar().filetypeCombo.getStore().getAt(window[app][panel+'Panel'].getTopToolbar().filetypeCombo.getStore().find('name', window[app][panel+'Panel'].getTopToolbar().filetypeCombo.getValue(), 0, true, true));

                                if(record.get('regex') && record.get('regex') != '')
                                    Ext.getCmp('picture').regex = record.get('regex');

                                showPictureForm(false, path, function(url){
                                    var name = record.get('name');
                                    window[app][panel+'Panel'].items.items[0].getStore().insert(window[app][panel+'Panel'].items.items[0].getStore().getCount(), new Ext.data.Record({
                                        url: url,
                                        name: name && name != '' ? name : ''
                                    }));

                                    window[app][panel+'Panel'].getTopToolbar().filetypeCombo.getStore().remove(record);
                                    window[app][panel+'Panel'].getTopToolbar().filetypeCombo.reset();
                                }, 1);
                            } 
                        }
                        else {
                            if(filetypes && filetypes != '')
                                Ext.getCmp('picture').regex = filetypes;

                            showPictureForm(false, path, function(url){
                                var name = url;
                                while(name.indexOf('/')>-1)
                                    name = name.substring(name.indexOf('/')+1, name.length);

                                window[app][panel+'Panel'].items.items[0].getStore().insert(window[app][panel+'Panel'].items.items[0].getStore().getCount(), new Ext.data.Record({
                                    url: url,
                                    name: name && name != '' ? name : ''
                                }));
                            }, 1);
                        }
                    }
                }
            });
            tbar.push({
                tooltip: bundle.getMsg('app.form.deleterow'),
                iconCls: Ext.ux.Icon('table_row_delete'),
                listeners: {
                    click: function() {
                        var records = window[app][panel+'Panel'].items.items[0].getSelectedRecords();
                        
                        //                        var array = new Array();
                        //                        for(var i = 0; i < records.length; i++){
                        //                            records[i].data.path = 'web/'+records[i].data.href;
                        //                            array.push(records[i].data);
                        //                        }
                        //                        
                        //                        new Ext.data.Connection().request({
                        //                            url: config.app_host + '/file/request/method/delete',
                        //                            params: {
                        //                                paths: Ext.encode(array)
                        //                            }
                        //                        });
                                            
                        if(Ext.isArray(filetypes)){
                            window[app][panel+'Panel'].getTopToolbar().filetypeCombo.getStore().add(records);
                            window[app][panel+'Panel'].getTopToolbar().filetypeCombo.reset();
                        } 
                        window[app][panel+'Panel'].items.items[0].getStore().remove(records);
                    }
                }
            });

            return new Ext.Panel({
                title: bundle.getMsg(entity+'.field.'+icon),
                iconCls: Ext.ux.Icon(icon),
                items: filesDataView.cloneConfig({
                    store: new Ext.data.Store({
                        reader: new Ext.data.JsonReader()
                    })
                }),
                autoScroll: true, 
                padding: 8,
                tbar: tbar
            });
        },

        printViewWithObjParam : function(app, index){
            var params = window[app].params;
            if(index)
                params = window[app].params[index];
            App.printView(window[app].source, window[app].header, window[app].footer, params);
        },

        printView : function(source, header, footer, params){
            this.grid = source;
            this.headercontent = header;
            this.footercontent = footer;
            this.gridparams = params;

            this.printableFontSize = 11;
			
            App.window = new Ext.Window({
                title: bundle.getMsg('app.languaje.report.visor'),
                iconCls: Ext.ux.Icon('magnifier'),
                modal: true,
                resizable: false,
                width:800,
                height:500,
                closeAction:'close',
                plain: true,
                layout: 'fit',
                tbar:[/*bundle.getMsg('app.languaje.report.font')+': ',{
                    iconCls: Ext.ux.Icon('fontsmaller', 'myicons'),
                    listeners: {
                        click: function() {
                            document.getElementById('ifReporter').contentWindow.App.increaseText(-1);
                        }
                    }
                },{
                    iconCls: Ext.ux.Icon('font'),
                    listeners: {
                        click: function() {
                            document.getElementById('ifReporter').contentWindow.App.increaseText(false);
                        }
                    }
                },{
                    iconCls: Ext.ux.Icon('fontlarger', 'myicons'),
                    listeners: {
                        click: function() {
                            document.getElementById('ifReporter').contentWindow.App.increaseText(1);
                        }
                    }
                }, '-', bundle.getMsg('app.languaje.report.paperorientation')+': ',{
                    ref: '../paperorientationBtn',
                    iconCls: Ext.ux.Icon('page_white_text'),
                    enableToggle: true,
                    pressed: true,
                    toggleGroup: 'paper_orientation'
                },{
                    iconCls: Ext.ux.Icon('page_white_text_width'),
                    enableToggle: true,
                    pressed: false,
                    toggleGroup: 'paper_orientation'
                }, */'->',{
                    text: 'PDF',
                    iconCls: Ext.ux.Icon('page_white_acrobat'),
                    hidden: true,
                    listeners: {
                        click: function() {
                            document.getElementById('ifReporter').contentWindow.App.genPDF();
                        }
                    }
                },{
                    text: bundle.getMsg('app.languaje.report.print'),
                    iconCls: Ext.ux.Icon('printer'),
                    //hidden: true,
                    listeners: {
                        click: function() {
                            document.getElementById('ifReporter').contentWindow.App.printPage();
                        }
                    }
                }],
                html: '<iframe id="ifReporter" style="width:100%; height: 100%; border:none;" src = "'+config.app_host+'/print/index"></iframe>',
                listeners: {
                    beforehide : function(component) {
                        this.html = '';
                    }
                }
            });
			
            App.window.show();
        },

        exploreFile : function(source){	
            App.exploresource = source;
            App.window = new Ext.Window({
                iconCls: Ext.ux.Icon('magnifier'),
                modal: true,
                resizable: false,
                autoScroll: true, 
                width:800,
                height:500,
                closeAction:'close',
                plain: true,
                layout: 'fit',
                bbar:[new Ext.slider.SingleSlider({
                    ref: 'slider',
                    width: 780,
                    value: 0,
                    minValue: 0,
                    maxValue: 500,
                    plugins: new Ext.slider.Tip({
                        getText: function(thumb){
                            App.window.body.dom.innerHTML = '<img src="'+App.exploresource+'" width="'+(thumb.value+100)+'%">';
                            return String.format('<b>+{0}%</b>', thumb.value);
                        }
                    }),
                    listeners: {
                        changecomplete: function(slider, newValue, thumb) {
                            App.window.body.dom.innerHTML = '<img src="'+App.exploresource+'" width="'+(newValue+100)+'%">'; 
                        }
                    }
                })],
                html: '<img src="'+App.exploresource+'" width="100%">'
            });
			
            App.window.show();
        },

        getNodeData : function(node) {
            var decodeNodeId = function(n){
                if(n && n.id != '' && n.id != 'NULL'){
                    var pattern = '[specialquot]';

                    var json = n.id;
                    while(json.indexOf(pattern)> -1){
                        json = json.replace(pattern, '"');
                    }
                    json = Ext.decode(json); 

                    n.attributes.id = json.id;
                    n.nick = n.attributes.entity = json.entity;
                }
                return n;
            };
            return decodeNodeId(node);
        },

        showWindow : function(title, width, height, items, acceptFn, cancelFn, animateTarget, manageable, printFn, menuConfig, hideApply, afterShow){
            return showWindow(title, width, height, items, acceptFn, cancelFn, animateTarget, manageable, printFn, menuConfig, hideApply, afterShow);
        },

        applySecurity : function(groups, permissions){
            if (!App.groups)
                App.groups = groups;
            if (!App.permissions)
                App.permissions = permissions;
        }
    }
}();