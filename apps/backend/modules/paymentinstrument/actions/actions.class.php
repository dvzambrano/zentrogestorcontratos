<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage paymentinstrument
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class paymentinstrumentActions extends sfBaseActions {

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {

            case 'combo':
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = PaymentinstrumentTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $paymentinstrument = array();
        $ak = Util::generateCode($request->getParameter('name'));

        if ($request->getParameter('id') != '')
            $paymentinstrument = Doctrine::getTable('Paymentinstrument')->find($request->getParameter('id'));

        if ($paymentinstrument == array()) {
            $paymentinstrument = Doctrine::getTable('Paymentinstrument')->findByAK($ak);
            if ($paymentinstrument)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('paymentinstrument.field.label', 'paymentinstrument.field.name', $request->getParameter('name'))
                        )));
            $paymentinstrument = new Paymentinstrument();
        }
        else {
            $testobj = Doctrine::getTable('Paymentinstrument')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getName() != $paymentinstrument->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('paymentinstrument.field.label', 'paymentinstrument.field.name', $request->getParameter('name'))
                        )));
        }

        $paymentinstrument->setCode($ak);
        $paymentinstrument->setName($request->getParameter('name'));
        $paymentinstrument->setComment($request->getParameter('comment'));

        $paymentinstrument->save();
        sfContext::getInstance()->getLogger()->alert('Salvado instrumento de pago ' . $paymentinstrument->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $paymentinstrument->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Paymentinstrument')->deleteByPK($pks);
    }

}
