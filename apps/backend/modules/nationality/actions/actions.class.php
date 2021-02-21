<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage nationality
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class nationalityActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {

            case 'combo':
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = NationalityTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $nationality = array();
        $ak = Util::generateCode($request->getParameter('name'));

        if ($request->getParameter('id') != '')
            $nationality = Doctrine::getTable('Nationality')->find($request->getParameter('id'));

        if ($nationality == array()) {
            $nationality = Doctrine::getTable('Nationality')->findByAK($ak);
            if ($nationality)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('nationality.field.label', 'nationality.field.name', $request->getParameter('name'))
                        )));
            $nationality = new Nationality();
        }
        else {
            $testobj = Doctrine::getTable('Nationality')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getName() != $nationality->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('nationality.field.label', 'nationality.field.name', $request->getParameter('name'))
                        )));
        }

        $nationality->setCode($ak);
        $nationality->setName($request->getParameter('name'));
        $nationality->setComment($request->getParameter('comment'));

        $nationality->save();
        sfContext::getInstance()->getLogger()->alert('Salvada moneda ' . $nationality->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $nationality->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Nationality')->deleteByPK($pks);
    }

}
