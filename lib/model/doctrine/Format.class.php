<?php

/**
 * Format
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @package    SGArqBase
 * @subpackage model
 * @author     MSc. Donel Vazquez Zambrano
 * @version    SVN: $Id: Builder.php 7490 2010-03-29 19:53:27Z jwage $
 */
class Format extends BaseFormat {

    const HTML_TAG_REGEX = '(\S+)=["\']?(([a-zA-ZÁÉÍÓÚáéíóúñüÑ :;,\_\>\/\-\(\)\[\]\{\}1234567890]*)+)["\']?';

    public static function cleanVariablesArray($array) {
        // cleaning accordig the template provided for the view
        $template = Util::getBundle("format.action.insertvariable.format");
        preg_match_all('#' . Format::HTML_TAG_REGEX . '#sm', $template, $matches, PREG_PATTERN_ORDER);

        foreach ($array as $key => $value)
            if (!in_array($key, $matches[1]))
                unset($array[$key]);
        unset($array["style"]);
        unset($array["disabled"]);
        unset($array["type"]);

        return $array;
    }

    public function getHTML4Contract($contract) {
        $array = json_decode($this->getVariables(), true);
        $array = Format::cleanVariablesArray($array);
//        print_r($array);
//        die;

        $array["eval"] = array();
        // evaluating mapping for each variable
        for ($index = 0; $index < count($array["mapping"]); $index++) {
            //Provider:decode[name,value],contacts
            $elements = explode(';', $array["mapping"][$index]);
            $actions = explode(':', $elements[0]);

            if (count($actions) > 1)
                $elements[0] = $actions[0];

            $sentence = '';
            foreach ($elements as $element)
                if ($element != "") {
                    if ($element[0] == strtolower($element[0]))
                        $sentence = $sentence . '->get' . Util::capitalize($element) . '()';
                    else
                        $sentence = $sentence . '->get' . $element . '()';
                }

            $pieces = explode("->", $sentence);
            $if = array();
            for ($i = 0; $i < count($pieces); $i++) {
                if ($pieces[$i] != "")
                    if (count($if) == 0)
                        $if[] = '$contract->' . $pieces[$i];
                    else
                        $if[] = $if[count($if) - 1] . '->' . $pieces[$i];
            }
            $if = implode(" && ", $if);
            $text = 'return $contract' . $sentence . ';';
            if ($if != "")
                $text = 'if(' . $if . ') return $contract' . $sentence . '; return false;';
            if (stripos($sentence, "->getPHP()") > -1)
                $text = 'return true;';

            $getvalue = create_function('$contract', $text);
            $value = array($getvalue($contract));

            if (count($actions) > 1) {
                $actions = explode(',', $actions[1]);
                $arrayindex = $actions[count($actions) - 1];
                unset($actions[count($actions) - 1]);
                $actions = implode(',', $actions);

                $fields = array();
                if (stripos($actions, "[") > -1) {
                    $fields = explode('[', $actions);
                    $actions = $fields[0];
                    $fields = explode(",", str_replace("]", "", $fields[1]));
                }

                switch ($actions) {
                    case 'decode':
                        if ($arrayindex != '')
                            $arrayindex = '->' . $arrayindex;
                        $sentence = '
                                    $value = json_decode($value); 
                                    $array = array(); 
                                    for ($index = 0; $index < count($value' . $arrayindex . '); $index++) 
                                        $array[] = $value' . $arrayindex . '[$index]->value; 
                                    return $array;';

                        if (count($fields) > 0) {
                            $sentence = '
                                    $value = json_decode($value); 
                                    $array = array(); 
                                    for ($index = 0; $index < count($value' . $arrayindex . '); $index++) { $item = array(); ';
                            foreach ($fields as $key => $field) {
                                $pieces = explode(">", $field);
                                $field = $pieces[0];
                                if (count($pieces) > 1)
                                    for ($i = 1; $i < count($pieces); $i++)
                                        $field = $field . '->' . $pieces[$i];
                                $sentence = $sentence . '$item[] = $value' . $arrayindex . '[$index]->' . $field . ';';
                            }

                            $sentence = $sentence . '$array[] = $item; } return $array;';
                        }
//                        print_r($getvalue($contract));
//                        die($arrayindex);
                        $arrayfromencondedvalue = create_function('$value', $sentence);
                        $value = $arrayfromencondedvalue($getvalue($contract));
                        break;
                    case 'decodeid':
                        $pieces = str_split($arrayindex);
                        unset($pieces[count($pieces) - 1]);
                        $getid = create_function('$contract', 'return $contract->get' . Util::capitalize(implode("", $pieces)) . 'id();');
                        $id = $getid($contract) - 1;

                        if (count($fields) > 0) {
                            $sentence = '
                                    $value = json_decode($value); 
                                    return array($value->' . $arrayindex . '[' . $id . ']->' . $fields[0] . ');';
                        }
                        $arrayfromencondedvalue = create_function('$value', $sentence);
                        $value = $arrayfromencondedvalue($getvalue($contract));
                        break;
                    case 'object':
                        //"modulenick" =>'Provider:object[document{name,number,date}],metadatas',
                        $fields = explode('{', implode(",", $fields));
                        $element = $fields[0];
                        $fields = explode(",", str_replace("}", "", $fields[1]));

                        $sentence = '
                                    $metadatas = json_decode($value); 
                                    $metadatas = $metadatas->' . $arrayindex . '->' . $element . ';
                                    $array = array();';
                        foreach ($fields as $field)
                            $sentence = $sentence . '$array[] = $metadatas->' . $field . '; ';
                        $sentence = $sentence . ' return $array;';

                        $objectfromencondedvalue = create_function('$value', $sentence);
                        $value = $objectfromencondedvalue($getvalue($contract));
                        break;
                    case 'php':
                        //"modulenick" =>'PHP:php,date()',
                        $sentence = "return array(" . str_replace("()", "('" . $elements[1] . "')", str_replace(";" . $elements[1], "", str_replace("PHP:php,", "", $array["mapping"][$index]))) . ");";
                        $getvalue = create_function("", $sentence);
                        $value = $getvalue();
                        break;
                    default:
                        break;
                }
            }

            if (!$value || $value == "")
                $value = array("________________");

            $array["eval"][$index] = $value;
        }

        $html = $this->getContent();

        preg_match_all('#<u><input(.*?)></u>#sm', $html, $matches, PREG_PATTERN_ORDER);
        $matches = $matches[0];

//        print_r($array);
//        print_r($array["eval"]);
//         print_r($matches);
//        echo '<hr/>';
//        die;

        foreach ($matches as $index => $value) {
            $variableseparator = "";
            $lineseparator = " ";
            $itemseparator = "";
            switch ($array["restriction"][$index]) {
                case 'commaseparatedsingleline':
                    $itemseparator = ", ";
                    break;
                case 'spaceseparatedsingleline':
                    $itemseparator = " ";
                    break;
                case 'doteparatedsingleline':
                    $itemseparator = ": ";
                    break;
                case 'table':
                    $variableseparator = array(
                        '<table style="font-size:15px; width:60%;">',
                        '</table>'
                    );
                    $lineseparator = array(
                        '<tr>',
                        '</tr>'
                    );
                    $itemseparator = array(
                        '<td>',
                        '</td>'
                    );
                    break;

                default:
                    break;
            }

            foreach ($array["eval"][$index] as $eval) {
                $replacement = $variableseparator;
                if (is_array($itemseparator))
                    $replacement = $variableseparator[0];

                if (is_array($eval)) {

                    if (is_array($itemseparator)) {
                        for ($i = 0; $i < count($array["eval"][$index]); $i++) {
                            $replacement .= $lineseparator[0];
                            for ($j = 0; $j < count($array["eval"][$index][$i]); $j++)
                                $replacement .= $itemseparator[0] . $array["eval"][$index][$i][$j] . $itemseparator[1];
                            $replacement .= $lineseparator[1];
                        }
                    } else {
                        for ($i = 0; $i < count($array["eval"][$index]); $i++) {
                            $replacement .= $lineseparator . $array["eval"][$index][$i][0];
                            for ($j = 1; $j < count($array["eval"][$index][$i]); $j++)
                                $replacement .= $itemseparator . $array["eval"][$index][$i][$j];
                            $replacement .= $lineseparator;
                        }
                    }
                } else {
                    $replacement .= $eval;
                }

                if (is_array($itemseparator))
                    $replacement .= $variableseparator[1];
                $html = str_replace($value, $replacement, $html);
            }
        }

        return $html;
    }

}