<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage reclamationstatus
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class reclamationstatusActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        
        $m = ModuleTable::getInstance()->getMultientityManager();
        $filter = $this->getFilter($request, $m && $m->getIsActive());

        switch ($request->getParameter('component')) {
            case 'combo':
                switch ($request->getParameter('restriction')) {
                    case 'onlyparents':
                        $rows = ReclamationstatusTable::getInstance()->getOnlyPimaries($filter);
                        break;
                    case 'next':
                        $rows = ReclamationstatusTable::getInstance()->getOnlyNext($request->getParameter('id'));
                        break;
                    default:
                        $rows = ReclamationstatusTable::getInstance()->getAll($filter);
                        break;
                }
                break;

            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');
                $rows = ReclamationstatusTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $reclamationstatus = array();
        $ak = Util::generateCode($request->getParameter('name') . $request->getParameter('entityid'));

        if ($request->getParameter('id') != '')
            $reclamationstatus = Doctrine::getTable('Reclamationstatus')->find($request->getParameter('id'));

        if ($reclamationstatus == array()) {
            $calendar = Doctrine::getTable('Calendar')->findByAK($ak);
            if ($calendar)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('reclamationstatus.field.label', 'reclamationstatus.field.name', $request->getParameter('name'))
                        )));
            $reclamationstatus = new Reclamationstatus();
            $reclamationstatus->setCalendar(new Calendar());
        }
        else {
            $testobj = Doctrine::getTable('Calendar')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getName() != $reclamationstatus->getCalendar()->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('calendar.field.label', 'calendar.field.name', $request->getParameter('name'))
                        )));
        }

        $reclamationstatus->getCalendar()->setName($request->getParameter('name'));
        $reclamationstatus->getCalendar()->setCode($ak);
        $reclamationstatus->getCalendar()->setComment($request->getParameter('comment'));
        $reclamationstatus->getCalendar()->setColor(rand(1, 33));

        $reclamationstatus->setCustomcolor($request->getParameter('customcolor'));

        $reclamationstatus->setIscomplete($request->getParameter('iscomplete') && $request->getParameter('iscomplete') == 'on');
        $reclamationstatus->setIssuspended($request->getParameter('issuspended') && $request->getParameter('issuspended') == 'on');

        if ($request->getParameter('entityid') && $request->getParameter('entityid') != '')
            $reclamationstatus->setEntityid($request->getParameter('entityid'));
        else
            $reclamationstatus->setEntityid(null);

        $reclamationstatus->save();
        sfContext::getInstance()->getLogger()->alert('Salvado estado de tarea ' . $reclamationstatus->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        $q = Doctrine_Query::create()
                ->delete('ReclamationstatusRelation')
                ->addWhere('fromstatus_id = ?', $reclamationstatus->getId());
        $deleted = $q->execute();

        if ($request->getParameter('status') && $request->getParameter('status') != '') {
            $statues = explode(",", $request->getParameter('status'));
            foreach ($statues as $status) {
                $relation = new ReclamationstatusRelation();
                $relation->setFromstatusId($reclamationstatus->getId());
                $relation->setTostatusId($status);
                $relation->save();
            }
        }

        return $reclamationstatus->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Reclamationstatus')->deleteByPK($pks);
    }

}
