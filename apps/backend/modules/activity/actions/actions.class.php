<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage activity
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class activityActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {

            case 'combo':
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = ActivityTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $activity = array();
        $ak = Util::generateCode($request->getParameter('name'));

        if ($request->getParameter('id') != '')
            $activity = Doctrine::getTable('Activity')->find($request->getParameter('id'));

        if ($activity == array()) {
            $activity = Doctrine::getTable('Activity')->findByAK($ak);
            if ($activity)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('activity.field.label', 'activity.field.name', $request->getParameter('name'))
                        )));
            $activity = new Activity();
        }
        else {
            $testobj = Doctrine::getTable('Activity')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getName() != $activity->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('activity.field.label', 'activity.field.name', $request->getParameter('name'))
                        )));
        }

        $activity->setCode($ak);
        $activity->setName($request->getParameter('name'));
        $activity->setComment($request->getParameter('comment'));

        $activity->save();
        sfContext::getInstance()->getLogger()->alert('Salvado tipo de reclamación ' . $activity->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $activity->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Activity')->deleteByPK($pks);
    }

}
