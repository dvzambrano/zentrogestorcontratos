<?php

/**
 * ContractTable
 * Codigo fuente generado por el SGArqBase: Plataforma de construcción de Sistemas.
 *
 * @author     MSc. Donel Vázquez Zambrano
 * @version    1.0.0
 */
class sfContractTable extends Doctrine_Table {

    /**
     * Returns an instance of this class.
     *
     * @return object ContractTable
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
                    array('name' => 'code', 'type' => 'string'),
                    array('name' => 'name', 'type' => 'string'),
                    array('name' => 'comment', 'type' => 'string'),
                    array('name' => 'duration', 'type' => 'decimal'),
                    array('name' => 'entityid', 'type' => 'int'),
                    array('name' => 'customicon', 'type' => 'string'),
                    array('name' => 'deleteable', 'type' => 'bool'),
                    array('name' => 'contracttypeid', 'type' => 'int'),
                    array('name' => 'contractstatusid', 'type' => 'int'),
                    array('name' => 'areaid', 'type' => 'int'),
                    array('name' => 'providerid', 'type' => 'int'),
                    array('name' => 'provideruserid', 'type' => 'int'),
                    array('name' => 'clientid', 'type' => 'int'),
                    array('name' => 'clientuserid', 'type' => 'int'),
                    array('name' => 'paymentinstruments', 'type' => 'string'),
                    array('name' => 'paymentwayid', 'type' => 'int'),
                    array('name' => 'paymentplaceid', 'type' => 'int'),
                    array('name' => 'Event'),
                    array('name' => 'Contracttype', 'mapping' => 'Contracttype.name', 'type' => 'string'),
                    array('name' => 'Contractstatus', 'mapping' => 'Contractstatus.Calendar.name', 'type' => 'string'),
                    array('name' => 'Area', 'mapping' => 'Area.name', 'type' => 'string'),
                    array('name' => 'counterpart', 'type' => 'string'),
                    array('name' => 'Provider'),
                    array('name' => 'Client'),
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

    const table = 'Contract';
    const akfield = 'code';

    public static function getAllPaged($start, $limit, $filters, $simple = false) {
        $entityid = false;
        foreach ($filters as $filter)
            if ($filter->field == 'entityid') {
                $entityid = $filter->value;
                break;
            }
        $select = 'true as deleteable, e.*, ct.*, cs.*, cal.*, a.*, p.*, c.*, e.name as name, e.comment as comment';
        if ($entityid)
            $select = $select . ', (SELECT q.name FROM Entity q WHERE (q.id = t.clientid AND t.clientid <> ' . $entityid . ') OR (q.id = t.providerid AND t.providerid <> ' . $entityid . ')) as counterpart';
        $query = BaseTable::getAllPaged(self::table, $start, $limit, $filters, array('t.Event e',
                    't.Contracttype ct', 't.Contractstatus cs', 'cs.Calendar cal', 't.Area a', 't.Provider p', 't.Client c'), array(
					array('field'=> 'name', 'realfield'=> 'name', 'char'=> 'e'),
					array('field'=> 'Contracttype', 'realfield'=> 'name', 'char'=> 'ct'),
					array('field'=> 'counterpart', 'realfield'=> 'name', 'char'=> array('p','c')),
					array('field'=> 'Area', 'realfield'=> 'name', 'char'=> 'a'),
					array('field'=> 'Contractstatus', 'realfield'=> 'name', 'char'=> 'cal'),
				), false, $select);
        if ($simple) {
            if ($simple === 2)
                return $query['results'];
            return $query['results']->toArray();
        }

        return self::formatData($query['results'], $query['page'], $query['count']);
    }

    public static function findByAK($ak) {
        return BaseTable::findByAK(self::table, self::akfield, $ak);
    }

    public static function getAll($filters = array(), $simple = false) {
        return self::getAllPaged(0, PHP_INT_MAX, $filters, $simple);
    }

    public static function deleteByPK($pks) {
        return BaseTable::deleteByPK(self::getInstance(), $pks);
    }

    public static function get4Report($report = '', $entityid = false, $month = 1, $date = 'start', $entitytypeid = false) {
        $elements = false;
        switch (strtolower($report)) {
            case 'inprogress':
                $elements = Contract::getInProgressQuery($entityid)->execute();
                break;
            case 'ontime':
                $elements = Contract::getOnTimeQuery($entityid)->execute();
                break;
            case 'outoftime':
                $elements = Contract::getOutOfTimeQuery($entityid)->execute();
                break;
            case 'comming':
                $elements = Contract::getCommingQuery($entityid)->execute();
                break;
            case 'expired':
                $elements = Contract::getExpiredQuery($entityid)->execute();
                break;
            case 'dateprovider':
                $elements = Contract::getBetween4ConditionQuery($date, $month, 't.providerid = ?', $entityid)->execute();
                break;
            case 'dateclient':
                $elements = Contract::getBetween4ConditionQuery($date, $month, 't.clientid = ?', $entityid)->execute();
                break;
            case 'entitytypeprovider':
                $elements = Contract::get4EntitytypeANDConditionQuery('t.providerid = ? AND c.entitytypeid = ?', $entityid, $entitytypeid)->execute();
                break;
            case 'entitytypeclient':
                $elements = Contract::get4EntitytypeANDConditionQuery('t.clientid = ? AND p.entitytypeid = ?', $entityid, $entitytypeid)->execute();
                break;
            case 'reclamationtypeprovider':
                $array = self::getByReclamationtype($entityid);
                foreach ($array as $value) {
                    if ($value["id"] == $entitytypeid) {
                        $elements = $value["provider"];
                        break;
                    }
                }
                break;
            case 'reclamationtypeclient':
                $array = self::getByReclamationtype($entityid);
                foreach ($array as $value) {
                    if ($value["id"] == $entitytypeid) {
                        $elements = $value["client"];
                        break;
                    }
                }
                break;
            default:
                $elements = Contract::getOutOfTimeQuery($entityid)->execute();
                break;
        }

        return $elements;
    }

    public static function getStadisticByCurrentDate($entityid = false) {
        $inprogress = Contract::getInProgressQuery($entityid)->count();
        $ontime = Contract::getOnTimeQuery($entityid)->count();
        $outoftime = Contract::getOutOfTimeQuery($entityid)->count();
        $comming = Contract::getCommingQuery($entityid)->count();
        $expired = Contract::getExpiredQuery($entityid)->count();

//        // for demo data only
//        $rows = array(
//            array('name' => Util::getBundle('contract.inprogress.title'), 'amount' => rand(1, 100), 'flag' => '2e8f0c'),
//            array('name' => Util::getBundle('contract.future.title'), 'amount' => rand(1, 100), 'flag' => 'f88015'),
//            array('name' => Util::getBundle('contract.ontime.title'), 'amount' => rand(1, 100), 'flag' => '83ad47'),
//            array('name' => Util::getBundle('contract.outoftime.title'), 'amount' => rand(1, 100), 'flag' => 'fa7166'),
//            array('name' => Util::getBundle('contract.expired.title'), 'amount' => rand(1, 100), 'flag' => 'cf2424')
//        );

        $rows = array(
            array('id' => 'inprogress', 'name' => Util::getBundle('contract.inprogress.title'), 'amount' => $inprogress, 'flag' => '2e8f0c'),
            array('id' => 'comming', 'name' => Util::getBundle('contract.future.title'), 'amount' => $comming, 'flag' => 'f88015'),
            array('id' => 'ontime', 'name' => Util::getBundle('contract.ontime.title'), 'amount' => $ontime, 'flag' => '83ad47'),
            array('id' => 'outoftime', 'name' => Util::getBundle('contract.outoftime.title'), 'amount' => $outoftime, 'flag' => 'fa7166'),
            array('id' => 'expired', 'name' => Util::getBundle('contract.expired.title'), 'amount' => $expired, 'flag' => 'cf2424')
        );

        $rows = array(
            'metaData' => array(
                'idProperty' => 'name',
                'root' => 'data',
                'totalProperty' => 'results',
                'fields' => array(
                    array('name' => 'id', 'type' => 'string'),
                    array('name' => 'name', 'type' => 'string'),
                    array('name' => 'amount', 'type' => 'int'),
                    array('name' => 'flag', 'type' => 'string')
                ),
                'sortInfo' => array(
                    'field' => 'name',
                    'direction' => 'ASC'
                )
            ),
            'success' => true,
            'message' => 'app.msg.info.loadedsuccessful',
            'results' => count($rows),
            'data' => $rows,
            'page' => 1
        );
        return $rows;
    }

    public static function getStadisticByDate($entityid = false, $date = 'start') {
        $rows = array();
        for ($index = 1; $index <= 12; $index++) {
//            // for demo data only
//            $rows[] = array('id' => $index, 'name' => Util::getMonthName($index), 'client' => rand(1, 100), 'phantom1' => 0, 'phantom2' => 0, 'provider' => rand(1, 100));

            $clientamount = 0;
            $provideramount = 0;
            if ($entityid) {
                $provideramount = Contract::getBetween4ConditionQuery($date, $index, 't.providerid = ?', $entityid)->count();
                $clientamount = Contract::getBetween4ConditionQuery($date, $index, 't.clientid = ?', $entityid)->count();
            }

            $rows[] = array('id' => $index, 'name' => Util::getMonthName($index), 'client' => $clientamount, 'phantom1' => 0, 'phantom2' => 0, 'provider' => $provideramount);
        }

        $rows = array(
            'metaData' => array(
                'idProperty' => 'name',
                'root' => 'data',
                'totalProperty' => 'results',
                'fields' => array(
                    array('name' => 'id', 'type' => 'int'),
                    array('name' => 'name', 'type' => 'string'),
                    array('name' => 'phantom1', 'type' => 'int'),
                    array('name' => 'phantom2', 'type' => 'int'),
                    array('name' => 'client', 'type' => 'int'),
                    array('name' => 'provider', 'type' => 'int')
                ),
                'sortInfo' => array(
                    'field' => 'id',
                    'direction' => 'ASC'
                )
            ),
            'success' => true,
            'message' => 'app.msg.info.loadedsuccessful',
            'results' => count($rows),
            'data' => $rows,
            'page' => 1
        );
        return $rows;
    }

    public static function getStadisticByEntitytype($entityid = false, $date = 'start') {
        $rows = array();

        $entitytypes = EntitytypeTable::getInstance()->getAllPaged(0, false, false, true);
        foreach ($entitytypes as $entitytype) {
//            // for demo data only
//            $item = $entitytype->toArray();
//            $item['client'] = rand(1, 100);
//            $item['provider'] = rand(1, 100);
//            $item['phantom1'] = $item['phantom2'] = 0;
//            $rows[] = $item;


            $item = $entitytype->toArray();
            $item['phantom1'] = $item['phantom2'] = 0;

            $clientamount = 0;
            $provideramount = 0;
            if ($entityid) {
                $provideramount = Contract::get4EntitytypeANDConditionQuery('t.providerid = ? AND c.entitytypeid = ?', $entityid, $entitytype->getId())->count();
                $clientamount = Contract::get4EntitytypeANDConditionQuery('t.clientid = ? AND p.entitytypeid = ?', $entityid, $entitytype->getId())->count();
            }
            $item['client'] = $clientamount;
            $item['provider'] = $provideramount;
            $item['phantom1'] = $item['phantom2'] = 0;

            $rows[] = $item;
        }

        $rows = array(
            'metaData' => array(
                'idProperty' => 'name',
                'root' => 'data',
                'totalProperty' => 'results',
                'fields' => array(
                    array('name' => 'id', 'type' => 'int'),
                    array('name' => 'name', 'type' => 'string'),
                    array('name' => 'phantom1', 'type' => 'int'),
                    array('name' => 'phantom2', 'type' => 'int'),
                    array('name' => 'client', 'type' => 'int'),
                    array('name' => 'provider', 'type' => 'int')
                ),
                'sortInfo' => array(
                    'field' => 'id',
                    'direction' => 'ASC'
                )
            ),
            'success' => true,
            'message' => 'app.msg.info.loadedsuccessful',
            'results' => count($rows),
            'data' => $rows,
            'page' => 1
        );
        return $rows;
    }

    public static function getByReclamationtype($entityid = false) {
        $filters = array();
        if ($entityid) {
            $obj = new stdClass();
            $obj->type = "int";
            $obj->field = "entityid";

            $obj->comparison = "eq";
            $obj->value = $entityid;

            $filters[] = $obj;
        }

        $reclamationtypes = ReclamationtypeTable::getInstance()->getAll(array(), true);
        $contracts = self::getAll($filters, 2);

        $array = array();

        foreach ($reclamationtypes as $reclamationtype) {
            $item = $reclamationtype->toArray();
            $item['client'] = array();
            $item['provider'] = array();

            foreach ($contracts as $contract) {
                $amount = Contract::get4ReclamationtypeANDConditionQuery('t.entityid = ? AND t.entity = ?', $contract->getId(), "ContractReclamations", $reclamationtype->getId())->count();
                if ($amount > 0)
                    if ($entityid && $entityid == $contract->getProviderid())
                        $item['provider'][] = $contract;
                    else
                        $item['client'][] = $contract;
            }

            $array[] = $item;
        }

        return $array;
    }

    public static function getStadisticByReclamationtype($entityid = false, $date = 'start') {
        $array = self::getByReclamationtype($entityid);
        for ($index = 0; $index < count($array); $index++) {
            $array[$index]["client"] = count($array[$index]["client"]);
            $array[$index]["provider"] = count($array[$index]["provider"]);
        }

        return array(
            'metaData' => array(
                'idProperty' => 'name',
                'root' => 'data',
                'totalProperty' => 'results',
                'fields' => array(
                    array('name' => 'id', 'type' => 'int'),
                    array('name' => 'name', 'type' => 'string'),
                    array('name' => 'phantom1', 'type' => 'int'),
                    array('name' => 'phantom2', 'type' => 'int'),
                    array('name' => 'client', 'type' => 'int'),
                    array('name' => 'provider', 'type' => 'int')
                ),
                'sortInfo' => array(
                    'field' => 'id',
                    'direction' => 'ASC'
                )
            ),
            'success' => true,
            'message' => 'app.msg.info.loadedsuccessful',
            'results' => count($array),
            'data' => $array,
            'page' => 1
        );
    }

    //[getByParentMethod]
}