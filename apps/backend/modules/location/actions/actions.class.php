<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage location
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class locationActions extends sfBaseActions {

    public function executeRequest(sfWebRequest $request) {
        Util::setExecutionEnviroment();
        $response = array();
        try {
            switch ($request->getParameter('method')) {
                case 'import':
                    $self = BaseTable::findByAK('Location', 'specialcode', $request->getParameter('code'));
                    if ($self && $self->getId() > 0)
                        $request->setParameter('id', $self->getId());
                    $array = str_split($request->getParameter('code'), 2);
                    $parent = BaseTable::findByAK('Location', 'specialcode', $array[0]);
                    if ($parent && $parent->getId() > 0 && $parent->getSpecialcode() != $request->getParameter('code')) {
                        $request->setParameter('path', '/NULL/' . $parent->getId());
                        $request->setParameter('parent_id', $parent->getId());
                    }
                    $request->setParameter('specialcode', $request->getParameter('code'));
                    $location = $this->save($request, false);
                    $response = array('success' => true, 'message' => $location);
                    break;
                default:
                    return parent::executeRequest($request);
                    break;
            }
        } catch (Exception $e) {
            $response = array('success' => false, 'message' => $e->getMessage());
        }
        return $this->renderText(json_encode($response));
    }

    public function load(sfWebRequest $request) {
        $rows = array();
        $filter = $this->getFilter($request);

        switch ($request->getParameter('component')) {
            case 'combo':
                $rows = LocationTable::getInstance()->getAll($filter);
                break;

            case 'tree':
                // hago la validacion para cuando se esta buscando un padre escribiendo y no seleccionando
                if (!$request->getParameter('query') || $request->getParameter('query') == '') {
                    $obj = new stdClass();
                    $obj->type = "int";
                    $obj->field = "parentid";
                    if ($request->getParameter('node') == '' || $request->getParameter('node') == 'NULL')
                        $obj->comparison = "null";
                    else {
                        $obj->comparison = "eq";
                        $obj->value = $request->getParameter('node');
                    }
                    $filter[] = $obj;
                }
                $rows = LocationTable::getInstance()->getByParent($filter, $request->getParameter('checkeable'));
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request, $riseexception = true) {
        $location = array();
        $ak = Util::generateCode($request->getParameter('name') . $request->getParameter('parent_id'));

        if ($request->getParameter('id') != '')
            $location = Doctrine::getTable('Location')->find($request->getParameter('id'));

        if ($location == array()) {
            $location = Doctrine::getTable('Location')->findByAK($ak);
            if ($riseexception && $location)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('location.field.label', 'location.field.name', $request->getParameter('name'))
                        )));
            $location = new Location();
        }
        else {
            $testobj = Doctrine::getTable('Location')->findByAK($ak);
            if ($riseexception && $testobj && ($request->getParameter('id') == '' || $testobj->getName() != $location->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('location.field.label', 'location.field.name', $request->getParameter('name'))
                        )));
        }

        $location->setCode($ak);
        $location->setName($request->getParameter('name'));
        $location->setComment($request->getParameter('comment'));
        if ($request->getParameter('specialcode') && $request->getParameter('specialcode') != '')
            $location->setSpecialcode($request->getParameter('specialcode'));
        if ($request->getParameter('icon_id') && $request->getParameter('icon_id') != '')
            $location->setIcon($request->getParameter('icon_id'));
        else
            $location->setIcon(null);
        if ($request->getParameter('parent_id') && $request->getParameter('parent_id') != '')
            $location->setParentid($request->getParameter('parent_id'));
        else
            $location->setParentid(null);


        $location->save();
        sfContext::getInstance()->getLogger()->alert('Salvada localización ' . $location->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        if ($request->getParameter('path') && $request->getParameter('path') != '')
            $location->setPath($request->getParameter('path') . '/' . $location->getId());
		else
            $location->setPath('/NULL/' . $location->getId());
		
		$location->save();

        return $location->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Location')->deleteByPK($pks);
    }

}
