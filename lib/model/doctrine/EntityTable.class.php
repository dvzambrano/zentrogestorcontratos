<?php

/**
 * EntityTable
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class EntityTable extends sfEntityTable {

    public static function formatData($array, $page, $count = false) {
        return array(
            'metaData' => array(
                'idProperty' => 'id',
                'root' => 'data',
                'totalProperty' => 'results',
                'fields' => array(
                    array('name' => 'id', 'type' => 'int'),
                    array('name' => 'code', 'type' => 'string'),
                    array('name' => 'specialcode', 'type' => 'string'),
                    array('name' => 'shortname', 'type' => 'string'),
                    array('name' => 'name', 'type' => 'string'),
                    array('name' => 'comment', 'type' => 'string'),
                    array('name' => 'address', 'type' => 'string'),
                    array('name' => 'profile', 'type' => 'string'),
                    array('name' => 'nit', 'type' => 'string'),
                    array('name' => 'parentid', 'type' => 'int'),
                    array('name' => 'locationid', 'type' => 'int'),
                    array('name' => 'entitytypeid', 'type' => 'int'),
                    array('name' => 'nationalityid', 'type' => 'int'),
                    array('name' => 'path', 'type' => 'string'),
                    array('name' => 'logo', 'type' => 'string'),
                    array('name' => 'customicon', 'type' => 'string'),
                    array('name' => 'deleteable', 'type' => 'bool'),
                    array('name' => 'images'),
                    array('name' => 'Entity'),
                    array('name' => 'Entitytype'),
                    array('name' => 'Location')
                ),
                'sortInfo' => array(
                    'field' => 'id',
                    'direction' => 'ASC'
                )
            ),
            'success' => true,
            'message' => 'app.msg.info.loadedsuccessful',
            'results' => $count,
            'data' => $array->toArray(),
            'page' => $page
        );
    }

    public static function getAllPaged($start, $limit, $filters, $simple = false, $where = false) {
        $select = 'true as deleteable, p.*, l.*, et.*';
//        $select = '(SELECT COUNT(q.entityid) FROM Transaction q WHERE q.entityid LIKE CONCAT(t.id, "-%-%") AND q.entity = "EntityClientReservation")<1 as deleteable';
        $query = BaseTable::getAllPaged(self::table, $start, $limit, $filters, array('t.Entity p', 't.Location l', 't.Entitytype et'), array(array(
                        'field' => 'entityid',
                        'realfield' => 'id',
                        'char' => 't'
                        )), false, $select, $where);
        
//        $select = 'sx.*, l.*, p.*, u.*, e.*, ppr.*, par.*, a.*, atx.*, tar.*, tx.*, tpr.*, srv.*, spr.*, (SELECT COUNT(q.activity_id) FROM PersonActivityRelation q WHERE q.activity_id = t.id)<1 as deleteable';
//
//        $query = BaseTable::getAllPaged(self::table, $start, $limit, $filters, array('t.sfGuardUser u'), array(
//                    array(
//                        'field' => 'name',
//                        'realfield' => array('first_name', 'last_name'),
//                        'char' => 'u'
//                    ), array(
//                        'field' => 'full_name',
//                        'realfield' => array('first_name', 'last_name'),
//                        'char' => 'u'
        if ($simple)
            return $query['results'];
        return self::formatData($query['results'], $query['page'], $query['count']);
    }

    public static function getAll($filters = array(), $simple = false) {
        $where = false;
        for ($index = 0; $index < count($filters); $index++)
            if ($filters[$index]->field == 'isorganism') {
                $where = 'SUBSTRING(specialcode, 1, 3 ) = SUBSTRING(specialcode, 9, 3) AND SUBSTRING(specialcode, 5, 1) = 0';
                unset($filters[$index]);
            }

        return self::getAllPaged(0, PHP_INT_MAX, $filters, $simple, $where);
    }

}