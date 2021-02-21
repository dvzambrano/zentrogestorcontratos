<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage reclamationtype
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class reclamationtypeActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {

            case 'combo':
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = ReclamationtypeTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $reclamationtype = array();
        $ak = Util::generateCode($request->getParameter('name'));

        if ($request->getParameter('id') != '')
            $reclamationtype = Doctrine::getTable('Reclamationtype')->find($request->getParameter('id'));

        if ($reclamationtype == array()) {
            $reclamationtype = Doctrine::getTable('Reclamationtype')->findByAK($ak);
            if ($reclamationtype)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('reclamationtype.field.label', 'reclamationtype.field.name', $request->getParameter('name'))
                        )));
            $reclamationtype = new Reclamationtype();
        }
        else {
            $testobj = Doctrine::getTable('Reclamationtype')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getName() != $reclamationtype->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('reclamationtype.field.label', 'reclamationtype.field.name', $request->getParameter('name'))
                        )));
        }

        $reclamationtype->setCode($ak);
        $reclamationtype->setName($request->getParameter('name'));
        $reclamationtype->setComment($request->getParameter('comment'));

        $reclamationtype->save();
        sfContext::getInstance()->getLogger()->alert('Salvado tipo de reclamación ' . $reclamationtype->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $reclamationtype->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Reclamationtype')->deleteByPK($pks);
    }

}
