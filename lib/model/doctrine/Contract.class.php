<?php

/**
 * Contract
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @package    SGArqBase
 * @subpackage model
 * @author     MSc. Donel Vazquez Zambrano
 * @version    SVN: $Id: Builder.php 7490 2010-03-29 19:53:27Z jwage $
 */
class Contract extends BaseContract {

    public static function getNoteNumber($json, $entity, $generated = "[CONTR]-[SEC]") {
        $identifier = 1;
        
        $array = Note::getJsonAsKeysValues($json);
        // if there is a number we return it and its done!
        if(isset($array["numberField"]["value"]) && $array["numberField"]["value"] != '')
            return $array["numberField"]["value"];
        
        $date = date_create_from_format('d/m/Y', date("d/m/Y"));
        if(isset($array["datefield"]["value"]) && $array["datefield"]["value"] != '')
            $date = date_create_from_format('d/m/Y', $array["datefield"]["value"]);
        
        $generated = str_replace('[A]', $date->format("Y"), $generated);
        $generated = str_replace('[a]', $date->format("y"), $generated);
        $generated = str_replace('[Y]', $date->format("Y"), $generated);
        $generated = str_replace('[y]', $date->format("y"), $generated);
        $generated = str_replace('[M]', $date->format("m"), $generated);
        $generated = str_replace('[m]', $date->format("m"), $generated);
        $generated = str_replace('[D]', $date->format("d"), $generated);
        $generated = str_replace('[d]', $date->format("d"), $generated);
            
        // determining max length of code
        $length = 3;
        preg_match_all('/(.*)\[SEC-(.*)\](.*)/', $generated, $pieces);
        if($pieces[2] && $pieces[2][0] && $pieces[2][0] > 0){
            $length = $pieces[2][0];
            $generated = str_ireplace('[SEC-'.$length.']', '[SEC]', $generated);
        }
        
        if(isset($array["hiddenField"])){
            $element = BaseTable::findByAK('Event', 'id', $array["hiddenField"]["value"]);
            $generated = str_ireplace('[CONTR]', $element->getName(), $generated);
            
            $elements = BaseTable::getAllPaged('Note', 0, 2, array(), array(), array(), 't.id DESC', false, 't.entity = "'.$entity.'" AND t.entityid = '.$array["hiddenField"]["value"]);
            if($elements['results']){
                $lastarray = Note::getJsonAsKeysValues($elements['results'][0]->getJson());	
                if(isset($lastarray["numberField"])){
                    $pattern = str_replace('/', '\/', $generated);
                    $pattern = str_ireplace('[SEC]', '(.*)', $pattern);
                    preg_match_all('/'.$pattern.'/', $lastarray["numberField"]["value"], $pieces);
                    
                    $identifier = $pieces[1][0]+1;		
                }
            }
        }
        $identifier = str_pad($identifier, $length, "0", STR_PAD_LEFT);
        $generated = str_ireplace('[SEC]', $identifier, $generated);
        
        return $generated;
    }
    public static function getSuplementNumber($json) {
        // CE[SEC]/[y] al [CONTR]
        $generated = '[CONTR]-[SEC]';
        $format = Util::getMetadataValue('app_suplementnumberformat');
        if($format && $format!=''){
            $generated = $format;
        }
        
        return self::getNoteNumber($json, "ContractSuplements", $generated);
    }
    public static function getReclamationNumber($json) {
        return self::getNoteNumber($json, "ContractReclamations");
    }
    
    public static function getInProgressQuery($entityid = false) {
        $query = Doctrine_Query::create()
                ->select('t.*')
                ->from('Contract t')
                ->leftJoin('t.Event e')
                ->where(Contract::getInProgressSubQuery());
        if ($entityid)
            $query->addWhere('t.providerid = ? OR t.clientid = ?', array($entityid, $entityid));

        return $query;
    }

    public static function getInProgressSubQuery() {
        return 'e.start < "' . date('Y-m-d H:i:s') . '" AND e.end > "' . date('Y-m-d H:i:s') . '" AND t.finished is null';
    }

    public static function getOnTimeQuery($entityid = false) {
        $query = Doctrine_Query::create()
                ->select('t.*')
                ->from('Contract t')
                ->leftJoin('t.Event e')
                ->where(Contract::getOnTimeSubQuery());
        if ($entityid)
            $query->addWhere('t.providerid = ? OR t.clientid = ?', array($entityid, $entityid));

        return $query;
    }

    public static function getOnTimeSubQuery() {
        return 't.finished <= e.end';
    }

    public static function getOutOfTimeQuery($entityid = false) {
        $query = Doctrine_Query::create()
                ->select('t.*')
                ->from('Contract t')
                ->leftJoin('t.Event e')
                ->where(Contract::getOutOfTimeSubQuery());
        if ($entityid)
            $query->addWhere('t.providerid = ? OR t.clientid = ?', array($entityid, $entityid));

        return $query;
    }

    public static function getOutOfTimeSubQuery() {
        return 't.finished > e.end';
    }

    public static function getCommingQuery($entityid = false) {
        $query = Doctrine_Query::create()
                ->select('t.*')
                ->from('Contract t')
                ->leftJoin('t.Event e')
                ->where(Contract::getCommingSubQuery());
        if ($entityid)
            $query->addWhere('t.providerid = ? OR t.clientid = ?', array($entityid, $entityid));

        return $query;
    }

    public static function getCommingSubQuery() {
        $date = date_create_from_format('Y-m-d H:i:s', date('Y-m-d H:i:s'));

        $days = Util::getMetadataValue('app_futuredaysamount');
        if ($days && $days > 0)
            $date->add(new DateInterval('P' . $days . 'D'));

        return 'e.start > "' . date('Y-m-d H:i:s') . '" AND e.start <= "' . $date->format('Y-m-d H:i:s') . chr(octdec('42'));
    }

    public static function getExpiredQuery($entityid = false) {
        $query = Doctrine_Query::create()
                ->select('t.*')
                ->from('Contract t')
                ->leftJoin('t.Event e')
                ->where(Contract::getExpiredSubQuery());
        if ($entityid)
            $query->addWhere('t.providerid = ? OR t.clientid = ?', array($entityid, $entityid));

        return $query;
    }

    public static function getExpiredSubQuery() {
        return 'e.end < "' . date('Y-m-d H:i:s') . '" AND e.end <> "0000-00-00 00:00:00" AND t.finished is null';
    }

    public static function getBetween4ConditionQuery($date = false, $month = 1, $condition = 't.providerid = ?', $entityid = 0) {
        $query = Doctrine_Query::create()
                ->select('t.*')
                ->from('Contract t')
                ->leftJoin('t.Event e');

        if ($date && $date != '') {
            $day = date_create_from_format('Y-m-d H:i:s', date('Y') . '-' . str_pad($month, 2, "0", STR_PAD_LEFT) . '-15' . ' 12:00:00');
            $query->addWhere('e.' . $date . ' <= "' . date('Y-m-d', strtotime('last day of ' . $day->format('M') . ' ' . $day->format('Y'))) . ' 23:59:59" AND e.' . $date . ' >= "' . date('Y-m-d', strtotime('first day of ' . $day->format('M') . ' ' . $day->format('Y'))) . ' 00:00:00"');
        }

        $query->addWhere($condition, $entityid);

        return $query;
    }

    public static function get4EntitytypeANDConditionQuery($condition = 't.providerid = ? AND c.entitytypeid = ?', $entityid = false, $entitytypeid = 1) {
        $query = Doctrine_Query::create()
                ->select('t.*')
                ->from('Contract t')
                ->leftJoin('t.Provider p')
                ->leftJoin('t.Client c');

        if ($entityid)
            $query->addWhere($condition, array($entityid, $entitytypeid));

        return $query;
    }

    public static function get4ReclamationtypeANDConditionQuery($condition = 't.entityid = ? AND t.entity = ?', $entityid = 1, $entity = "ContractReclamations", $reclamationtypeid = 1) {
        $query = Doctrine_Query::create()
                ->select('t.*')
                ->from('Note t')
                ->where('t.json LIKE "[[_dateField_,_reclamationtypeCombo_,_numberField_,_receptiondateField_,_reclamaionstatusCombo_],[_____________________,' . $reclamationtypeid . ',%"');

        if ($entityid)
            $query->addWhere($condition, array($entityid, $entity));

        return $query;
    }

    public function getClientPosition() {
        return $this->getPositionFromPersonProfileById($this->getClientid());
    }

    public function getProviderPosition() {
        return $this->getPositionFromPersonProfileById($this->getProviderid());
    }

    private function getPositionFromPersonProfileById($id) {
        $person = Doctrine_Query::create()
                        ->select('t.*')
                        ->from('Person t')
                        ->where('t.profile LIKE "%entityid__' . $id . '__documenttype%"')->fetchOne();

        return $person;
    }

}