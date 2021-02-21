<html>
    <head>
        <style>
            @page {
              size: auto;
              odd-header-name: html_MyHeader1;
              odd-footer-name: html_MyFooter1;
            }

            @page chapter2 {
                odd-header-name: html_MyHeader2;
                odd-footer-name: html_MyFooter2;
            }

            @page noheader {
                odd-header-name: _blank;
                odd-footer-name: _blank;
            }

            div.chapter2 {
                page-break-before: always;
                page: chapter2;
            }

            div.noheader {
                page-break-before: always;
                page: noheader;
            }
            table.change_order_items { 
                /*font-size: 8pt;*/
                width: 100%;
                border-collapse: collapse;
                margin-top: 2em;
                margin-bottom: 2em;
            }

            table.change_order_items>tbody { 
                border: 1px solid black;
            }

            table.change_order_items>tbody>tr>th { 
                border-bottom: 1px solid black;
            }

            table.change_order_items>tbody>tr>td { 
                border-right: 1px solid black;
                padding: 0.5em;
            }
            table.change_order_items>thead { 
                border: 1px solid black;
            }

            table.change_order_items>thead>tr>th { 
                border-bottom: 1px solid black;
            }

            table.change_order_items>thead>tr>td { 
                border-right: 1px solid black;
                padding: 0.5em;
            }


            td.change_order_total_col { 
                padding-right: 4pt;
                text-align: right;
            }

            td.change_order_unit_col { 
                padding-left: 2pt;
                text-align: left;
            }

            .even_row td {
                /*  background-color: #F8EEE4;
                  border-top: 3px solid #FFFFff;*/
                background-color: #f6f6f6;
                border-bottom: 0.9px solid #ddd;
            }

            .written_field { 
                border-bottom: 0.1pt solid black;
            }

        </style>
    </head>
    <body>
        <htmlpageheader name="MyHeader1">
            <div style="text-align: right; <!--border-bottom: 1px solid #000000;--> font-weight: bold; font-size: 10pt;"></div>
        </htmlpageheader>
        
        <table style="width: 100%;">
            <tr>
                <td style="width: 70%; text-align:center; font-size:24px;"><b><?php echo strtoupper($title) ?></b></td>
                <td style="width: 30%; text-align:right;"><img src="<?php echo $entity->getLogo() ?>" alt="<?php echo $entity->getName() ?>" height="70px"></td>
            </tr>
        </table>  
        
        <?php foreach ($items as $key =>$item): ?>
            <h3><?php echo $key+1 ?>) Contrato: <b><?php echo $item['event']['name'] ?></b></h3>
            <table style="width: 100%; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 8pt;">
                <tr>
                    <td><b><?php echo $item['contracttype']['name'] ?></b></td>
                    <td>No. de contrato: <b><?php echo $item['event']['name'] ?></b></td>
                    <td>Fecha de firma: <b><?php echo $item['event']['start'] ?></b></td>
                    <td>Fecha de vencimiento: <b><?php echo $item['event']['end'] ?></b></td>
                </tr>
            </table>

            <table style="width: 100%; font-size: 8pt;">
                <tr>
                    <td>&Aacute;rea: <b><?php echo $item['area']['name'] ?></b></td>
                    <td>Estado: <b><?php echo $item['contractstatus']['name'] ?></b></td>
                </tr>
                <tr>
                    <td colspan="2"><b>Objeto</b>: <?php echo $item['event']['comment'] ?></td>
                </tr>
            </table>

            <table style="width: 100%; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 8pt;">
                <tr>
                    <td colspan="2">Cliente: <b><?php echo $item['client']['entitytype']['name'] ?></b> <?php echo $item['client']['name'] ?></td>
                </tr>
                <tr>
                    <td>Direcci&oacute;n: <?php echo $item['client']['address'] ?> <b><?php echo $item['client']['location']['name'] ?></b></td>
                    <td><?php 
                    foreach ($item['client']['profile']['contacts'] as $contact) {
                        echo $contact['name'].': '.$contact['value'].'<br/>';
                    }
                     ?></td>
                </tr>
            </table>
            <table style="width: 100%; border-bottom: 1px solid black; font-size: 8pt;">
                <tr>
                    <td colspan="2">Proveedor: <b><?php echo $item['provider']['entitytype']['name'] ?></b> <?php echo $item['provider']['name'] ?></td>
                </tr>
                <tr>
                    <td>Direcci&oacute;n: <?php echo $item['provider']['address'] ?> <b><?php echo $item['provider']['location']['name'] ?></b></td>
                    <td><?php 
                    foreach ($item['provider']['profile']['contacts'] as $contact) {
                        echo $contact['name'].': '.$contact['value'].'<br/>';
                    }
                     ?></td>
                </tr>
            </table>
            <br/><br/>
        <?php endforeach ?>

        <htmlpagefooter name="MyFooter1">
            <table width="100%" style="vertical-align: bottom;">
                <tr>
                    <td width="90%" style="font-size: 8px;"><?php echo Util::getBundle('app.languaje.report.author', 'es-ES', array($user->getFirstName().' '.$user->getLastName(), Util::getMetadataValue('app_name'))) ?></td>
                    <td width="10%" style="text-align: right; visibility:hidden;">{PAGENO}/{nbpg}</td>
                </tr>
            </table>
        </htmlpagefooter>
    </body>
</html>