<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage contract
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class sfContractActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {

            case 'combo':
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = ContractTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;
            case 'stadistic':
                $id = false;
                if ($request->getParameter('entityid') && $request->getParameter('entityid') != '')
                    $id = $request->getParameter('entityid');

                switch ($request->getParameter('type')) {
                    case 'bydate':
                        $rows = ContractTable::getInstance()->getStadisticByCurrentDate($id);
                        break;
                    case 'aproved':
                        $rows = ContractTable::getInstance()->getStadisticByDate($id);
                        break;
                    case 'finish':
                        $rows = ContractTable::getInstance()->getStadisticByDate($id, 'end');
                        break;
                    case 'entitytype':
                        $rows = ContractTable::getInstance()->getStadisticByEntitytype($id);
                        break;
                    case 'byreclamationtype':
                        $rows = ContractTable::getInstance()->getStadisticByReclamationtype($id);
                        break;
                    default:
                        break;
                }

                break;
            case 'report':
                $contract = Doctrine::getTable('Contract')->find($request->getParameter('id'));
                $format = BaseTable::findByAK('Format', 'id', $request->getParameter('format'));

                die($format->getHTML4Contract($contract));
            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $contract = array();
        $isnew = false;

        $ak = Util::generateCode($request->getParameter('name') . $request->getParameter('entityid'));
        if (!$request->getParameter('name') || $request->getParameter('name') == ''){
            // if there is no name to the contract (contract number), we generate one
            $generated = '[Y][m]-[SEC]';
            
            $format = Util::getMetadataValue('app_contractnumberformat');
            if($format && $format!=''){
                $generated = $format;
            }
            
            $date = date_create_from_format('d/m/Y', date("d/m/Y"));
            if ($request->getParameter('startdate') && $request->getParameter('startdate') != '')
                $date = date_create_from_format('d/m/Y', $request->getParameter('startdate'));
            
            $generated = str_replace('[A]', $date->format("Y"), $generated);
            $generated = str_replace('[a]', $date->format("y"), $generated);
            $generated = str_replace('[Y]', $date->format("Y"), $generated);
            $generated = str_replace('[y]', $date->format("y"), $generated);
            $generated = str_replace('[M]', $date->format("m"), $generated);
            $generated = str_replace('[m]', $date->format("m"), $generated);
            $generated = str_replace('[D]', $date->format("d"), $generated);
            $generated = str_replace('[d]', $date->format("d"), $generated);
            //throw new Exception('-> '.$generated);
            
            // determining max length of code
            $length = 3;
            preg_match_all('/(.*)\[SEC-(.*)\](.*)/', $generated, $array);
            if($array[2] && $array[2][0] && $array[2][0] > 0){
                $length = $array[2][0];
                $generated = str_ireplace('[SEC-'.$length.']', '[SEC]', $generated);
            }
            //throw new Exception('-> '.$length);
            
            $identifier = 1;
            $element = BaseTable::findLikeAK('Event', 'name', '%'.str_ireplace('[SEC]', '%', $generated).'%', 't.id DESC');
            if($element){
                $pattern = str_replace('/', '\/', $generated);
                $pattern = str_ireplace('[SEC]', '(.*)', $pattern);
                //throw new Exception('-> '.$pattern);
                //preg_match_all('/CB(.*)\/21/', $element->getName(), $array);
                preg_match_all('/'.$pattern.'/', $element->getName(), $array);
                
                $identifier = $array[1][0]+1;
            }
            $identifier = str_pad($identifier, $length, "0", STR_PAD_LEFT);
            $generated = str_ireplace('[SEC]', $identifier, $generated);
            //throw new Exception('-> '.$generated);
                        
            $request->setParameter('name', $generated);
            $ak = Util::generateCode($generated . $request->getParameter('entityid'));
        }

        if ($request->getParameter('id') != '')
            $contract = Doctrine::getTable('Contract')->find($request->getParameter('id'));

        if ($contract == array()) {
            $event = Doctrine::getTable('Event')->findByAK($ak);
            if ($event)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('contract.field.label', 'contract.field.name', $request->getParameter('name'))
                        )));
            $contract = new Contract();
            $contract->setEvent(new Event());

            $sender = Doctrine::getTable('sfGuardUser')->retrieveByUsername($this->getUser()->getUsername());
            $contract->setCreatedBy($sender->getPerson()->getId());
            $isnew = true;
        }
        else {
            $testobj = Doctrine::getTable('Event')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getCode() != $contract->getEvent()->getCode()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('contract.field.label', 'contract.field.name', $request->getParameter('name'))
                        )));
        }

        $contract->getEvent()->setCode($ak);
        $contract->getEvent()->setName($request->getParameter('name'));
        $contract->getEvent()->setComment($request->getParameter('comment'));

        if ($request->getParameter('startdate') && $request->getParameter('startdate') != '')
            $contract->getEvent()->setStart(Util::convertToDate($request->getParameter('startdate'), 'd/m/Y', 'Y-m-d H:i:s'));
        else
            $contract->getEvent()->setStart(null);
        if ($request->getParameter('enddate') && $request->getParameter('enddate') != '')
            $contract->getEvent()->setEnd(Util::convertToDate($request->getParameter('enddate'), 'd/m/Y', 'Y-m-d H:i:s'));
        else
            $contract->getEvent()->setEnd(null);

        $contract->setDuration($request->getParameter('duration'));

        $contract->setContracttypeid($request->getParameter('contracttypeid'));
        $contract->setAreaid($request->getParameter('areaid'));
        $contract->setProviderid($request->getParameter('providerid'));
        if ($request->getParameter('provideruserid') && $request->getParameter('provideruserid') != '')
            $contract->setProvideruserid($request->getParameter('provideruserid'));
        $contract->setClientid($request->getParameter('clientid'));
        if ($request->getParameter('clientuserid') && $request->getParameter('clientuserid') != '')
            $contract->setClientuserid($request->getParameter('clientuserid'));

        $contract->setPaymentinstruments($request->getParameter('paymentinstruments'));
        $contract->setPaymentwayid($request->getParameter('paymentwayid'));
        $contract->setPaymentplaceid($request->getParameter('paymentplaceid'));

        $status = Doctrine::getTable('Contractstatus')->find($request->getParameter('contractstatusid'));
        if ($request->getParameter('percentage') && $request->getParameter('percentage') != '')
            $contract->setPercentage($request->getParameter('percentage'));
        else {
            if ($status)
                $contract->setPercentage($status->getPercent());
            else
                $contract->setPercentage(0);
        }
        if ($status) {
            $contract->setContractstatusid($status->getId());
            $contract->getEvent()->setCalendarid($status->getCalendar()->getId());

            if ($status->getIscomplete())
                $contract->setFinished(date('Y-m-d H:i:s'));
        }

        $contract->setManuallyprogrammed($request->getParameter('manuallyprogrammed') && $request->getParameter('manuallyprogrammed') == 'on');

        $contract->setEntityid($request->getParameter('entityid'));

        $contract->save();
        sfContext::getInstance()->getLogger()->alert('Salvado contrato ' . $contract->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        $emailalloewd = Util::getMetadataValue('app_sendsystememails');
        $emailstrategy = Util::getMetadataValue('app_mailstrategy');
        $mailline = array();
        /*
          if ($emailalloewd && $isnew) {
          $filter = array();
          $obj = new stdClass();
          $obj->type = "int";
          $obj->field = "id";
          $obj->comparison = "eq";
          $obj->value = $contract->getId();
          $filter[] = $obj;

          $rows = ContractTable::getInstance()->getAllPaged(0, 1, $filter);
          $behavior = Util::getBundle('contract.field.label');
          if ($rows['data'] && $rows['data'][0] && $rows['data'][0]['isinvitation'])
          $behavior = Util::getBundle('task.field.type');

          $start = date_create_from_format('Y-m-d H:i:s', $contract->getEvent()->getStart());
          $end = date_create_from_format('Y-m-d H:i:s', $contract->getEvent()->getEnd());

          $mailtouser = array(
          //                'sendto' => $contract->getPerson()->getSfGuardUser()->getEmailAddress(),
          'subject' => array(
          //                    'msg' => 'task.action.creationnotify.mailsubject',
          'params' => array($behavior)
          ),
          'partial' => 'mail/NewTaskSuccess',
          'params' => array(
          //                    'fullname' => $contract->getPerson()->getFullName(),
          'taskbehavior' => $behavior,
          'name' => $contract->getEvent()->getName(),
          'type' => $contract->getContracttype()->getName(),
          'status' => $contract->getContractstatus()->getCalendar()->getName(),
          'begindate' => $start->format('d/m/Y g:i A'),
          'enddate' => $end->format('d/m/Y g:i A'),
          'serndername' => $contract->getCreator() && $contract->getCreator()->getId() > 0 ? $contract->getCreator()->getFullName() : $contract->getPerson()->getFullName(),
          )
          );
          switch (strtolower($emailstrategy)) {
          case 'queue':
          $mail = new Mailqueue();
          $mail->setValue(json_encode($mailtouser));
          $mail->setName(Util::generateCode($mail->getValue() . rand(1, PHP_INT_MAX) . rand(1, PHP_INT_MAX) . rand(1, PHP_INT_MAX)));
          $mail->save();
          break;
          default:
          $mailline = array($mailtouser);
          break;
          }
          }
         */
        $contract = $contract->toArray();
        if ($mailline && count($mailline) > 0)
            $contract['mailline'] = json_encode($mailline);

        return $contract;
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Contract')->deleteByPK($pks);
    }

    public function executeReport(sfWebRequest $request) {
        $this->user = Doctrine::getTable('sfGuardUser')->retrieveByUsername($this->getUser()->getUsername());
        $this->entity = Doctrine::getTable('Entity')->find($request->getParameter('entityid'));
        
        //$report = '', $entityid = false, $month = 1, $date = 'start', $entitytypeid = false
        $contracts = Doctrine::getTable('Contract')->get4Report($request->getParameter('id'), $request->getParameter('entityid'), $request->getParameter('month'), $request->getParameter('date'), $request->getParameter('entitytypeid'));

        $this->title = $request->getParameter('title');

        $this->items = array();
        foreach ($contracts as $contract) {
            $item = $contract->toArray();

            $item['event'] = $contract->getEvent()->toArray();

            if ($item['event']['start'] != "" && $item['event']['start'] != "0000-00-00 00:00:00")
                $item['event']['start'] = Util::convertToDate($item['event']['start'], 'Y-m-d H:i:s', 'd/m/Y');

            if ($item['event']['end'] != "" && $item['event']['end'] != "0000-00-00 00:00:00")
                $item['event']['end'] = Util::convertToDate($item['event']['end'], 'Y-m-d H:i:s', 'd/m/Y');

            $item['contracttype'] = $contract->getContracttype()->toArray();
            $item['area'] = $contract->getArea()->toArray();

            $item['contractstatus'] = $contract->getContractstatus()->toArray();
            $item['contractstatus']['name'] = $contract->getEvent()->getCalendar()->getName();

            $item['client'] = $contract->getClient()->toArray();
            $item['client']['entitytype'] = $contract->getClient()->getEntitytype()->toArray();
            $item['client']['location'] = $contract->getClient()->getLocation()->toArray();
            $item['client']['profile'] = json_decode($item['client']['profile'], true);

            $item['provider'] = $contract->getProvider()->toArray();
            $item['provider'] = $contract->getProvider()->toArray();
            $item['provider']['entitytype'] = $contract->getProvider()->getEntitytype()->toArray();
            $item['provider']['location'] = $contract->getProvider()->getLocation()->toArray();
            $item['provider']['profile'] = json_decode($item['provider']['profile'], true);

            $this->items[] = $item;
        }
    }

    public function executeGraph(sfWebRequest $request) {

        $rows = array(
            'data' => array()
        );

        switch ($request->getParameter('title')) {
            case 'contract.chart.bydate':
                $rows = ContractTable::getInstance()->getStadisticByCurrentDate($request->getParameter('id'));
                $this->data = "data=" . str_replace('"', "'", json_encode($rows['data'])) . "&data1index=amount&splitnames=1";
                break;
            case 'contract.chart.aproved':
                $rows = ContractTable::getInstance()->getStadisticByDate($request->getParameter('id'));
                $this->data = "data=" . str_replace('"', "'", json_encode($rows['data'])) . "&data1index=client&data2index=provider&splitnames=1";
                break;
            case 'contract.chart.entitytype':
                $rows = ContractTable::getInstance()->getStadisticByEntitytype($request->getParameter('id'));
                $this->data = "data=" . str_replace('"', "'", json_encode($rows['data'])) . "&data1index=client&data2index=provider&left=250&height=800";
                break;
            case 'contract.chart.finish':
                $rows = ContractTable::getInstance()->getStadisticByDate($request->getParameter('id'), 'end');
                $this->data = "data=" . str_replace('"', "'", json_encode($rows['data'])) . "&data1index=client&data2index=provider&splitnames=1";
                break;
            case 'contract.chart.reclamationtype':
                $rows = ContractTable::getInstance()->getStadisticByReclamationtype($request->getParameter('id'));
                $this->data = "data=" . str_replace('"', "'", json_encode($rows['data'])). "&data1index=client&data2index=provider&splitnames=1";
                break;

            default:
                break;
        }

        $this->title = Util::switchTextFormat(Util::getBundle($request->getParameter('title')));
    }

}
