<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage entitytype
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class entitytypeActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {

            case 'combo':
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = EntitytypeTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $entitytype = array();
        $ak = Util::generateCode($request->getParameter('name'));

        if ($request->getParameter('id') != '')
            $entitytype = Doctrine::getTable('Entitytype')->find($request->getParameter('id'));

        if ($entitytype == array()) {
            $entitytype = Doctrine::getTable('Entitytype')->findByAK($ak);
            if ($entitytype)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('entitytype.field.label', 'entitytype.field.name', $request->getParameter('name'))
                        )));
            $entitytype = new Entitytype();
        }
        else {
            $testobj = Doctrine::getTable('Entitytype')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getName() != $entitytype->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('entitytype.field.label', 'entitytype.field.name', $request->getParameter('name'))
                        )));
        }

        $entitytype->setCode($ak);
        $entitytype->setName($request->getParameter('name'));
        $entitytype->setComment($request->getParameter('comment'));

        $entitytype->save();
        sfContext::getInstance()->getLogger()->alert('Salvado tipo de entidad ' . $entitytype->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $entitytype->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Entitytype')->deleteByPK($pks);
    }

}
