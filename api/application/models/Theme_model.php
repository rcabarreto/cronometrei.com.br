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
		$return = $this->db->get();
		if($return->num_rows() > 0){
			foreach ($return->result() as $row) {
				return $row;
			}
		}
	}
	
	public function load_random_theme(){
		$this->db->select('*');
		$this->db->from('theme');
		$this->db->where(array('active' => 1));
		$this->db->order_by('id', 'RANDOM');
		$this->db->limit(1);
		$return = $this->db->get();
		if($return->num_rows() > 0){
			foreach ($return->result() as $row) {
				return $row;
			}
		}
	}
	
}
?>