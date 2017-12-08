set :use_sudo, false
set :scm, :git
set :deploy_via, :remote_cache
# set :repository, "git@github.com:nielstj/node_auth_token.git"
set :repository, "https://github.com/nielstj/node_auth_token.git"


set :application, "AuthToken"

role :app, "52.221.250.207"

set :deploy_to, "/home/ec2-user/AuthToken"
set :branch, fetch(:branch, "master")

set :keep_releases, 3

set :user, "ec2-user"
set :ssh_options, {
    :forward_agent => true
}
# set :linked_dirs, %w[ BE/node_modules FE/node_modules ]
# default_run_options[:pty] = true # needed for the password prompt from git to work

before "deploy:restart", "deploy:npm"
after "deploy:restart", "deploy:cleanup"

namespace :deploy do
  task :update do
    transaction do
      update_code # built-in function
      symlink # built-in function
    end
  end

  task :npm do
    transaction do
      run "cd #{current_release} && npm install"
      run "#{current_release}/node_modules/.bin/knex db:migrate latest"
    end
  end

  # task :copy_env do
  #   transaction do
  #     top.upload "#{Dir.pwd}/.env" "#{current_release}/.env"
  #   end
  # end

  task :restart do
    transaction do
      run "pm2 delete auth-token-server; true"
      run "cd #{current_release} && pm2 start src/server/server.js --name auth-token-server";
    end
  end
end
