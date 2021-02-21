<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage area
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class areaActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {

            case 'combo':
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = AreaTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $area = array();
        $ak = Util::generateCode($request->getParameter('name').$request->getParameter('entityid'));

        if ($request->getParameter('id') != '')
            $area = Doctrine::getTable('Area')->find($request->getParameter('id'));

        if ($area == array()) {
            $area = Doctrine::getTable('Area')->findByAK($ak);
            if ($area)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('area.field.label', 'area.field.name', $request->getParameter('name'))
                        )));
            $area = new Area();
        }
        else {
            $testobj = Doctrine::getTable('Area')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getCode() != $area->getCode()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('area.field.label', 'area.field.name', $request->getParameter('name'))
                        )));
        }

        $area->setCode($ak);
        $area->setName($request->getParameter('name'));
        $area->setComment($request->getParameter('comment'));
        $area->setEntityid($request->getParameter('entityid'));

        $area->save();
        sfContext::getInstance()->getLogger()->alert('Salvada área ' . $area->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $area->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Area')->deleteByPK($pks);
    }

}
