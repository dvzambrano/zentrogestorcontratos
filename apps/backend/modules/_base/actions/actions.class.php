<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage _base
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class _baseActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {
            case 'CASES':
            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $_base = array();
        $ak = Util::generateCode($request->getParameter('_akfield'));

        if ($request->getParameter('id') != '')
            $_base = Doctrine::getTable('_Base')->find($request->getParameter('id'));

        if ($_base == array()) {
            $_base = Doctrine::getTable('_Base')->findByAK($ak);
            if ($_base)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('_base.field.label', '_base.field._akfield', $request->getParameter('_akfield'))
                        )));
            $_base = new _Base();
        }
        else {
            $testobj = Doctrine::getTable('_Base')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->get_Akfield() != $_base->get_Akfield()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('_base.field.label', '_base.field._akfield', $request->getParameter('_akfield'))
                        )));
        }

        $setAttributes = '';

        $_base->save();
        sfContext::getInstance()->getLogger()->alert('Salvad@ _base ' . $_base->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $_base->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('_Base')->deleteByPK($pks);
    }

}
