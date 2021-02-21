<?php

/**
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @package    SGArqBase
 * @subpackage format
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class formatActions extends sfBaseActions {

    public function executeRequest(sfWebRequest $request) {
        Util::setExecutionEnviroment();
        $response = array();
        try {
            switch ($request->getParameter('method')) {
                case 'savecontent':
                    $response = $this->savecontent($request);
                    break;
                case 'test':
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
            case 'grid':
                $start = $request->getParameter('start');
                $limit = $request->getParameter('limit');

                $rows = FormatTable::getInstance()->getAllPaged($start, $limit, $filter);
                break;
            case 'varcombo':
                $module = BaseTable::findByAK("Module", "nick", "Contract");
                $array = array();
                $attributes = json_decode($module->getAttributes());
                foreach ($attributes as $attribute)
                    $array[] = array(
                        "name" => $attribute->name,
                        "nick" => $attribute->nick,
                        "mapping" => $attribute->mapping ? $attribute->mapping . ';' . $attribute->nick : $attribute->nick
                    );

                $relations = json_decode($module->getRelations());
                foreach ($relations as $relation) {
                    $nick = $relation->moduleid;
                    if ($relation->modulenick && $relation->modulenick != "")
                        $nick = $relation->modulenick;
                    $array[] = array(
                        "name" => $relation->attribute,
                        "nick" => Util::generateCode($nick . $relation->moduleattributeid),
                        "mapping" => $nick . ';' . $relation->moduleattributeid
                    );
                }

                $array = array_values($array);

                $rows = array(
                    'metaData' => array(
                        'idProperty' => 'nick',
                        'root' => 'data',
                        'totalProperty' => 'results',
                        'fields' => array(
                            array('name' => 'nick', 'type' => 'string'),
                            array('name' => 'name', 'type' => 'string'),
                            array('name' => 'mapping', 'type' => 'string')
                        ),
                        'sortInfo' => array(
                            'field' => 'name',
                            'direction' => 'ASC'
                        )
                    ),
                    'success' => true,
                    'message' => 'app.msg.info.loadedsuccessful',
                    'results' => count($array),
                    'data' => $array,
                    'page' => 1
                );
                break;
            default:
                break;
        }

        return $rows;
    }

    public function save(sfWebRequest $request) {
        $format = array();
        $ak = Util::generateCode($request->getParameter('name') . $request->getParameter('entityid'));

        if ($request->getParameter('id') != '')
            $format = Doctrine::getTable('Format')->find($request->getParameter('id'));

        if ($format == array()) {
            $format = Doctrine::getTable('Format')->findByAK($ak);
            if ($format)
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('format.field.label', 'format.field.name', $request->getParameter('name'))
                        )));
            $format = new Format();
        }
        else {
            $testobj = Doctrine::getTable('Format')->findByAK($ak);
            if ($testobj && ($request->getParameter('id') == '' || $testobj->getCode() != $format->getCode()))
                throw new Exception(json_encode(array(
                            msg => 'app.error.duplicatedalternatekey',
                            params => array('format.field.label', 'format.field.name', $request->getParameter('name'))
                        )));
        }

        $format->setCode($ak);
        $format->setName($request->getParameter('name'));
        $format->setComment($request->getParameter('comment'));
        $format->setEntityid($request->getParameter('entityid'));

        $format->save();
        sfContext::getInstance()->getLogger()->alert('Salvado formato ' . $format->exportTo('json') . ' por el usuario "' . $this->getUser()->getUsername() . '".');

        return $format->toArray();
    }

    public function delete(sfWebRequest $request) {
        $pks = json_decode(stripslashes($request->getParameter('ids')));
        return Doctrine::getTable('Format')->deleteByPK($pks);
    }

    public function savecontent(sfWebRequest $request) {
        $content = $request->getParameter('content');

        while (stripos($content, '<b> </b>')) {
            $content = str_replace('<b> </b>', '', $content);
        }
        while (stripos($content, '<b></b>')) {
            $content = str_replace('<b></b>', '', $content);
        }

        $html = SimpleHtmlDom::str_get_html($content);

        preg_match_all('#' . Format::HTML_TAG_REGEX . '#sm', $html, $matches, PREG_PATTERN_ORDER);

        $array = array();

        foreach ($matches[1] as $key => $value) {
            if (!isset($array[$value]))
                $array[$value] = array();
            $array[$value][] = $matches[2][$key];
        }

        $array = Format::cleanVariablesArray($array);
//        print_r($array);
//        die;

        $format = Doctrine::getTable('Format')->find($request->getParameter('id'));
        $format->setContent($content);
        $format->setVariables(json_encode($array));
        $format->save();
    }

}
