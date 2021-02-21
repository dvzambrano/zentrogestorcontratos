<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage contractstatus
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class contractstatusActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        
        $m = ModuleTable::getInstance()->getMultientityManager();
        $filter = $this->getFilter($request, $m && $m->getIsActive());

        switch ($request->getParameter('component')) {
            case 'combo':
                switch ($request->getParameter('restriction')) {
                    case 'onlyparents':
                        $rows = ContractstatusTable::getInstance()->getOnlyPimaries($filter);
                        break;
                    case 'next':
                        $rows = ContractstatusTable::getInstance()->getOnlyNext($request->getParameter('id'));
                        break;
                    default:
                        $rows = ContractstatusTable::getInstance()->getAll($filter);
                        break;
                }
                break;

            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');
                $rows = ContractstatusTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $contractstatus = array();
        $ak = Util::generateCode($request->getParameter('name') . $request->getParameter('entityid'));

        if ($request->getParameter('id') != '')
            $contractstatus = Doctrine::getTable('Contractstatus')->find($request->getParameter('id'));

        if ($contractstatus == array()) {
            $calendar = Doctrine::getTable('Calendar')->findByAK($ak);
            if ($calendar)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('contractstatus.field.label', 'contractstatus.field.name', $request->getParameter('name'))
                        )));
            $contractstatus = new Contractstatus();
            $contractstatus->setCalendar(new Calendar());
        }
        else {
            $testobj = Doctrine::getTable('Calendar')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getName() != $contractstatus->getCalendar()->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('calendar.field.label', 'calendar.field.name', $request->getParameter('name'))
                        )));
        }

        $contractstatus->getCalendar()->setName($request->getParameter('name'));
        $contractstatus->getCalendar()->setCode($ak);
        $contractstatus->getCalendar()->setComment($request->getParameter('comment'));
        $contractstatus->getCalendar()->setColor(rand(1, 33));

        $contractstatus->setCustomcolor($request->getParameter('customcolor'));

        $contractstatus->setIscomplete($request->getParameter('iscomplete') && $request->getParameter('iscomplete') == 'on');
        $contractstatus->setIssuspended($request->getParameter('issuspended') && $request->getParameter('issuspended') == 'on');

        if ($request->getParameter('entityid') && $request->getParameter('entityid') != '')
            $contractstatus->setEntityid($request->getParameter('entityid'));
        else
            $contractstatus->setEntityid(null);

        $contractstatus->save();
        sfContext::getInstance()->getLogger()->alert('Salvado estado de tarea ' . $contractstatus->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        $q = Doctrine_Query::create()
                ->delete('ContractstatusRelation')
                ->addWhere('fromstatus_id = ?', $contractstatus->getId());
        $deleted = $q->execute();

        if ($request->getParameter('status') && $request->getParameter('status') != '') {
            $statues = explode(",", $request->getParameter('status'));
            foreach ($statues as $status) {
                $relation = new ContractstatusRelation();
                $relation->setFromstatusId($contractstatus->getId());
                $relation->setTostatusId($status);
                $relation->save();
            }
        }

        return $contractstatus->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Contractstatus')->deleteByPK($pks);
    }

}
