<?php

if (!defined('BASEPATH'))
	exit('No direct script access allowed');

class Timer_model extends CI_Model{

	public function load_user($objUser){
		$sqlWhere = array('id' => $objUser->id);
		$this->db->select('*');
		$this->db->from('users');
		$this->db->where($sqlWhere);
		$return = $this->db->get();
		if($return->num_rows() > 0){
			foreach ($return->result() as $row) {
				$objUser->facebook_id = $row->facebook_id;
				$objUser->name = $row->full_name;
				$objUser->first_name = $row->first_name;
				$objUser->last_name = $row->last_name;
				$objUser->email = $row->email;
				$objUser->gender = $row->gender;
				$objUser->link = $row->link;
				$objUser->locale = $row->locale;
				$objUser->timezone = $row->timezone;
			}
		    return true;
		}else{
			return false;
		}
	}

	public function insert_timer($data){
		$insertData = array(
			'user_id' => $data->user_id,
			'start' => $data->start,
			'end' => $data->end,
			'timer' => $data->timer
		);
		$this->db->insert('timer', $insertData);
		return $this->db->insert_id();
	}
	
	public function remove_user($id){
		$this->db->delete('user', array('id' => $id));
		return true;
	}
	
	public function update_user($id, $data){
		$this->db->update('user', $data, array('id' => $id));
		return true;
	}

}
?>