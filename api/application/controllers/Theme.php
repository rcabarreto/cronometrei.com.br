<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Theme extends CI_Controller {

	public function __construct(){
		parent::__construct();
		$this->load->model('theme_model', 'theme');
	}

	public function loadTheme(){
		if($this->input->post('userid')){
			$viewData['echoJSON'] = json_encode($this->theme->load_theme($this->input->post('userid')));
		}else{
			$viewData['echoJSON'] = json_encode($this->theme->load_random_theme());
		}
		$this->load->view('jsonDump', $viewData);
	}

}
