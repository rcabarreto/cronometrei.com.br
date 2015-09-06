<?php

if (!defined('BASEPATH'))
	exit('No direct script access allowed');

class System_model extends CI_Model{

	public function insert_feedback($data){
		$insertData = array(
			'name' => $data->name,
			'answer' => $data->answer,
			'message' => $data->message
		);
		$this->db->insert('feedback', $insertData);
		return $this->db->insert_id();
	}
	
}
?>