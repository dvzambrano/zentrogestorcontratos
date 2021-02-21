<?php

/**
 * ContractstatusTable
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class ContractstatusTable extends Doctrine_Table {

    /**
     * Returns an instance of this class.
     *
     * @return object ContractstatusTable
     */
    public static function getInstance() {
        return Doctrine_Core::getTable(self::table);
    }

    public static function formatData($array, $page, $count = false) {
        return array(
            'metaData' => array(
                'idProperty' => 'id',
                'root' => 'data',
                'totalProperty' => 'results',
                'fields' => array(
                    array('name' => 'id', 'type' => 'int'),
                    array('name' => 'customcolor', 'type' => 'string'),
                    array('name' => 'calendarid', 'type' => 'int'),
                    array('name' => 'entityid', 'type' => 'int'),
                    array('name' => 'iscomplete', 'type' => 'bool'),
                    array('name' => 'issuspended', 'type' => 'bool'),
                    array('name' => 'deleteable', 'type' => 'bool'),
                    array('name' => 'Calendar'),
                    array('name' => 'ContractStatues')
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

    const table = 'Contractstatus';
    const akfield = 'code';

    public static function getAllPaged($start, $limit, $filters, $simple = false) {
        $select = 'c.*, nrs.*, (SELECT COUNT(l.id) FROM Contract l WHERE l.contractstatusid = t.id)<1 as deleteable';
        $query = BaseTable::getAllPaged(self::table, $start, $limit, $filters, array('t.Calendar c', 't.ContractStatues nrs'), array(
                    array(
                        'field' => 'name',
                        'realfield' => 'name',
                        'char' => 'c'
                    ), array(
                        'field' => 'comment',
                        'realfield' => 'comment',
                        'char' => 'c'
                        )), false, $select);
        if ($simple)
            return $query['results'];
        return self::formatData($query['results'], $query['page'], $query['count']);
    }

    public static function findByAK($ak) {
        $table = 'Calendar';

        $q = Doctrine_Query::create()
                ->select('t.*')
                ->from($table . ' t')
                ->leftJoin('t.Contractstatus ts')
                ->where('t.' . self::akfield . ' = ?', $ak)
                ->limit(1);
        return $q->fetchOne();
    }

    public static function getAll($filters = array(), $simple = false) {
//        print_r($filters);
        return self::getAllPaged(0, PHP_INT_MAX, $filters, $simple);
    }

    public static function getOnlyPimaries($filters = array()) {
        $select = 'c.*';
        $query = BaseTable::getAllPaged(self::table, 0, PHP_INT_MAX, $filters, array('t.Calendar c'), array(array(
                        'field' => 'name',
                        'realfield' => 'id',
                        'char' => 'c'
                        )), false, $select, '(SELECT COUNT(l.tostatus_id) FROM ContractstatusRelation l WHERE l.tostatus_id = t.id)<1');

        return self::formatData($query['results'], $query['page'], $query['count']);
    }

    public static function getOnlyNext($fromid) {
        $q = Doctrine_Query::create()
                ->select('t.*')
                ->from('ContractstatusRelation t')
                ->where('t.fromstatus_id = ?', $fromid);
        $ids = array();
        $rows = $q->execute();
        foreach ($rows as $relation)
            $ids[] = $relation->getTostatusId();

        $q = Doctrine_Query::create()
                ->select('t.*, c.*')
                ->from('Contractstatus t')
                ->leftJoin('t.Calendar c')
                ->whereIn('id', $ids)
                ->orWhere('t.id = ?', $fromid);
        $rows = $q->execute();

        return self::formatData($rows, 1, count($rows));
    }

    public static function deleteByPK($pks) {
        return BaseTable::deleteByPK(self::getInstance(), $pks);
    }

    // for importing from filepurposes. DO NOT DELETE!
    public static function getRebuilded($array = array()) {
        $contractstatus = false;

        if (!$contractstatus && $array['Calendar']['code'] != '') {
            $contractstatus = Doctrine::getTable('Calendar')->findByAK($array['Calendar']['code']);
            if ($contractstatus && $contractstatus->getContractstatus() && $contractstatus->getContractstatus()->getId() > 0)
                $contractstatus = $contractstatus->getContractstatus();
            else
                $contractstatus = false;
        }

        if (!$contractstatus && $array['id'] > 0) {
            $contractstatus = new Contractstatus();
            $contractstatus->fromArray($array);

            $contractstatus->save();
        }

        return $contractstatus;
    }

}