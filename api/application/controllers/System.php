<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class System extends CI_Controller {

	public function __construct(){
		parent::__construct();
		$this->load->model('system_model', 'system');
	}

	public function setFeedback(){
		$viewData['echoJSON'] = json_encode($this->system->load_random_theme());
		$this->load->view('jsonDump', $viewData);
	}

}
