<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage entity
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class entityActions extends sfEntityActions {

    public function executeRequest(sfWebRequest $request) {
        Util::setExecutionEnviroment();
        $response = array();
        try {
            switch ($request->getParameter('method')) {
                case 'import':
                    /*
                      code: files[0][8]+'-'+files[0][13]+'-'+files[0][0],
                      name: files[0][1],
                      shortname: files[0][2],
                      address: files[0][3],
                      dpa: files[0][5],
                      type: files[0][11],
                      sub: files[0][14]
                     */
                    // getting Location with given DPA
                    $location = BaseTable::findByAK('Location', 'specialcode', $request->getParameter('dpa'));
                    if ($location && $location->getId() > 0)
                        $request->setParameter('locationid', $location->getId());

                    // getting Entitytype with given TYPE
                    $entitytype = BaseTable::findByAK('Entitytype', 'specialcode', $request->getParameter('type'));
                    if ($entitytype && $entitytype->getId() > 0)
                        $request->setParameter('entitytypeid', $entitytype->getId());

                    // getting parent Entity with given SUBORDINATION
                    $parent = BaseTable::findLikeAK('Entity', 'specialcode', "%-%-" . str_pad(trim($request->getParameter('sub')), 5, "0", STR_PAD_LEFT));
                    if ($parent && $parent->getId() > 0 && $parent->getSpecialcode() != $request->getParameter('code')) {
                        $request->setParameter('path', '/NULL/' . $parent->getId());
                        $request->setParameter('parentid', $parent->getId());
                    }

                    // fixing the code to match reeup format
                    $array = explode("-", str_replace("undefined", "", $request->getParameter('code')));
                    if (!$array[0] || $array[0] == "") {
                        $array[0] = str_pad(trim($array[2]), 3, "0", STR_PAD_LEFT);
                        $request->setParameter('address', '');
                    }
                    if (!$array[1] || $array[1] == "") {
                        $array[1] = "0";
                        $request->setParameter('address', '');
                    }
                    $array[2] = str_pad(trim($array[2]), 5, "0", STR_PAD_LEFT);
                    $request->setParameter('specialcode', implode("-", $array));

                    // fixing the shortname to delete the '- - - - -' format
                    if ($request->getParameter('shortname') && $request->getParameter('shortname') != "") {
                        $shortname = str_replace(" ", "", str_replace("-", "", $request->getParameter('shortname')));
                        if ($shortname == "")
                            $request->setParameter('shortname', "");
                    }

                    // tryingto guess a update uploaded file
                    $self = BaseTable::findByAK('Entity', 'specialcode', $request->getParameter('specialcode'));
                    if ($self && $self->getId() > 0)
                        $request->setParameter('id', $self->getId());

                    $entity = $this->save($request, false);
                    $response = array('success' => true, 'message' => $entity);
                    break;
                case 'organize':
                    /*
                      code: files[0][0],
                      name: files[0][1],
                      shortname: files[0][2]
                     */
                    $entity = array();
                    $specialcode = trim($request->getParameter('code')) . "-0-" . str_pad(trim($request->getParameter('code')), 5, "0", STR_PAD_LEFT);
                    $self = BaseTable::findLikeAK('Entity', 'specialcode', $specialcode);
                    if ($self && $self->getId() > 0) {
                        $self->setShortname($request->getParameter('shortname'));
                        $self->save();

                        $entity = $self->toArray();
                    } else {
                        $request->setParameter('specialcode', $specialcode);
                        $entity = $this->save($request, false);
                    }

                    $response = array('success' => true, 'message' => $entity);
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

        $where = false;
        for ($index = 0; $index < count($filter); $index++)
            if ($filter[$index]->field == 'isorganism') {
                $where = 'SUBSTRING(specialcode, 1, 3 ) = SUBSTRING(specialcode, 9, 3) AND SUBSTRING(specialcode, 5, 1) = 0';
                unset($filter[$index]);
            }

        switch ($request->getParameter('component')) {
            case 'combo':
                $request->setParameter('limit', PHP_INT_MAX);
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = EntityTable::getInstance()->getAllPaged($start, $limit, $filter, false, $where);
                break;

            case 'tree':
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

                $rows = EntityTable::getInstance()->getByParent($filter, $request->getParameter('checkeable'));
                break;

            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request, $riseexception = true) {
        $entity = array();
        $ak = Util::generateCode($request->getParameter('name'));

        if ($request->getParameter('id') != '')
            $entity = Doctrine::getTable('Entity')->find($request->getParameter('id'));

        if ($entity == array()) {
            $entity = Doctrine::getTable('Entity')->findByAK($ak);
            if ($riseexception && $entity)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('entity.field.label', 'entity.field.name', $request->getParameter('name'))
                        )));
            $entity = new Entity();
        }
        else {
            $testobj = Doctrine::getTable('Entity')->findByAK($ak);
            if ($riseexception && $testobj && ($request->getParameter('id') == '' || $testobj->getName() != $entity->getName()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('entity.field.label', 'entity.field.name', $request->getParameter('name'))
                        )));
        }

        $entity->setCode($ak);
        $entity->setName($request->getParameter('name'));
        $entity->setComment($request->getParameter('comment'));
        $entity->setLogo($request->getParameter('logo'));
        $entity->setImages($request->getParameter('images'));
        $entity->setPath($request->getParameter('path'));

        $values = json_decode($request->getParameter('values'));
        $indexes = json_decode($request->getParameter('indexes'));
        $profile = array();
        for ($index = 0; $index < count($indexes); $index++)
            $profile[$indexes[$index]] = $values[$index];
        $entity->setProfile(json_encode($profile));

        if ($request->getParameter('parentid') && $request->getParameter('parentid') != '')
            $entity->setParentid($request->getParameter('parentid'));
        else
            $entity->setParentid(null);

        $entity->setShortname($request->getParameter('shortname'));
        if ($request->getParameter('specialcode') && $request->getParameter('specialcode') != '')
            $entity->setSpecialcode($request->getParameter('specialcode'));
        if ($request->getParameter('locationid') && $request->getParameter('locationid') != '')
            $entity->setLocationid($request->getParameter('locationid'));
        else
            $entity->setLocationid(null);
        if ($request->getParameter('entitytypeid') && $request->getParameter('entitytypeid') != '')
            $entity->setEntitytypeid($request->getParameter('entitytypeid'));
        else
            $entity->setEntitytypeid(null);
        if ($request->getParameter('nationalityid') && $request->getParameter('nationalityid') != '')
            $entity->setNationalityid($request->getParameter('nationalityid'));
        else
            $entity->setNationalityid(null);

        $entity->setAddress($request->getParameter('address'));
        $entity->setNit($request->getParameter('nit'));

        $entity->save();
        sfContext::getInstance()->getLogger()->alert('Salvada entidad ' . $entity->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $entity->toArray();
    }

}
