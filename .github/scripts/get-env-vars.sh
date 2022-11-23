prj_name=$1
env_name=$2

# echo $(aws ssm get-parameter --name "/${prj_name}/${env_name}/env-vars")

# aws ssm get-parameter --name "/${prj_name}/${env_name}/env-vars" | \
#     python3 -c "import sys, json; print(json.load(sys.stdin)['Parameter']['Value'])" > \
#     $GITHUB_WORKSPACE/.env

echo $(aws secretsmanager get-secret-value --secret-id "/${prj_name}/${env_name}/env-vars")

aws secretsmanager get-secret-value \
    --secret-id "/${prj_name}/${env_name}/env-vars" | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['SecretString'])" > \
    $GITHUB_WORKSPACE/.env