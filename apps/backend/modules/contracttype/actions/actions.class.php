<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage contracttype
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class contracttypeActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {

            case 'combo':
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = ContracttypeTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $contracttype = array();
        $ak = Util::generateCode($request->getParameter('name'));

        if ($request->getParameter('id') != '')
            $contracttype = Doctrine::getTable('Contracttype')->find($request->getParameter('id'));

        if ($contracttype == array()) {
            $contracttype = Doctrine::getTable('Contracttype')->findByAK($ak);
            if ($contracttype)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('contracttype.field.label', 'contracttype.field.name', $request->getParameter('name'))
                        )));
            $contracttype = new Contracttype();
        }
        else {
            $testobj = Doctrine::getTable('Contracttype')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getName() != $contracttype->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('contracttype.field.label', 'contracttype.field.name', $request->getParameter('name'))
                        )));
        }

        $contracttype->setCode($ak);
        $contracttype->setName($request->getParameter('name'));
        $contracttype->setComment($request->getParameter('comment'));

        $contracttype->save();
        sfContext::getInstance()->getLogger()->alert('Salvado tipo de contrato ' . $contracttype->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $contracttype->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Contracttype')->deleteByPK($pks);
    }

}
