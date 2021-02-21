<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage documenttype
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class documenttypeActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {

            case 'combo':
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = DocumenttypeTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $documenttype = array();
        $ak = Util::generateCode($request->getParameter('name'));

        if ($request->getParameter('id') != '')
            $documenttype = Doctrine::getTable('Documenttype')->find($request->getParameter('id'));

        if ($documenttype == array()) {
            $documenttype = Doctrine::getTable('Documenttype')->findByAK($ak);
            if ($documenttype)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('documenttype.field.label', 'documenttype.field.name', $request->getParameter('name'))
                        )));
            $documenttype = new Documenttype();
        }
        else {
            $testobj = Doctrine::getTable('Documenttype')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getName() != $documenttype->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('documenttype.field.label', 'documenttype.field.name', $request->getParameter('name'))
                        )));
        }

        $documenttype->setCode($ak);
        $documenttype->setName($request->getParameter('name'));
        $documenttype->setComment($request->getParameter('comment'));

        $documenttype->save();
        sfContext::getInstance()->getLogger()->alert('Salvado tipo de documento ' . $documenttype->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $documenttype->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Documenttype')->deleteByPK($pks);
    }

}
