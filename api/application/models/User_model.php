<?php

if (!defined('BASEPATH'))
	exit('No direct script access allowed');

class User_model extends CI_Model{

	public function checkUser($objUser, &$userID){
		$sqlWhere = array('facebook_id' => $objUser->id);
		$this->db->select('id');
		$this->db->from('users');
		$this->db->where($sqlWhere);
		$return = $this->db->get();
		if($return->num_rows() > 0){
			foreach ($return->result() as $row) {
				$userID = (int)$row->id;
			}
		    return true;
		}else{
			return false;
		}
	}

	public function insert_user($data){
		$insertData = array(
			'facebook_id' => $data->id,
			'full_name' => $data->name,
			'email' => $data->email,
			'gender' => $data->gender,
			'link' => $data->link,
			'locale' => $data->locale
		);
		$this->db->insert('users', $insertData);
		return $this->db->insert_id();
	}
	
	public function remove_user($id){
		$this->db->delete('user', array('id' => $id));
		return true;
	}
	
	public function update_user($userid, $data){
		$this->db->update('user', $data, array('id' => $userid));
		return true;
	}

}
?>