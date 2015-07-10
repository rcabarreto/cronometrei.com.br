<?php

if (!defined('BASEPATH'))
	exit('No direct script access allowed');

class Theme_model extends CI_Model{

	public function load_theme(){
		$this->db->select('*');
		$this->db->from('theme');
		$this->db->where(array('active' => 1));
		$this->db->order_by('id', 'RANDOM');
		$this->db->limit(1);
		return $this->db->get()->result();
	}
	
	public function get_random_bgimage(){
		$this->db->select('*');
		$this->db->from('theme');
		$this->db->where(array('active' => 1));
		$this->db->order_by('id', 'RANDOM');
		$this->db->limit(1);
		return $this->db->get()->result();
	}

	public function getUserName($tagid, &$username){

		$sqlWhere = array('tag.tag' => $tagid);

		$this->db->select('name');
		$this->db->from('user');
		$this->db->join('tag', 'user.tag_id = tag.id', 'inner');
		$this->db->where($sqlWhere);

		$return = $this->db->get();

		if($return->num_rows() > 0){
			foreach ($return->result() as $row) {
				$username = $row->name;
			}
		    return true;
		}else{
			return false;
		}

	}

	public function get_users(){

		$this->db->select('user.*, tag.tag as tagcode');
		$this->db->from('user');
		$this->db->join('tag', 'user.tag_id = tag.id', 'left');

		return $this->db->get()->result();

	}

	public function get_single_user($userid){

		$sqlWhere = array('id' => $userid);

		$this->db->select('*');
		$this->db->from('user');
		$this->db->where($sqlWhere);

		return $this->db->get()->result();

	}

	public function insert_user($data){

		$insertData = array(
			'name' => $data['username'],
			'email' => $data['useremail']
		);

		$insertID = $this->db->insert('user', $insertData);

		return $insertID;

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