<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User extends CI_Controller {

	public function __construct(){
		parent::__construct();
		$this->load->model('user_model', 'user');
	}

	public function loadUserInfo(){

		if($this->input->post('json')){
			$json = $this->input->post('json');
			$objUser = json_decode($json);
			if( $this->user->checkUser($objUser, $userID) ){
				$objUser->userid = $userID;
			}else{
				$objUser->userid = $this->user->insert_user($objUser);
			}
			$viewData['echoJSON'] = json_encode($objUser);
			$this->load->view('jsonDump', $viewData);
		}
	}

}
