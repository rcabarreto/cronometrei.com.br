<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User extends CI_Controller {

	public function __construct(){
		parent::__construct();
		$this->load->model('user_model', 'user');
	}


	public function loadUserInfo(){
		
		$objUser = json_decode($this->input->post('json'));
		$objUser->appid = 1;
		
		// if( $this->user->checkUser($objUser) ){
		// 	// update user info and return user id
		// 	$objUser->appid = $this->user->update_user($objUser);
		// }else{
		// 	// insert user into dabatase and return id
		// 	$objUser->appid = $this->user->insert_user($objUser);
		// }

		$viewData['echoJSON'] = json_encode($objUser);
		$this->load->view('jsonDump', $viewData);

	}

}
