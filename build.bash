version_tag="1.0.2"
repo_host="10.12.135.233"
repo_name="front-frame/omega-ca"
image_name_with_tag="$repo_host/$repo_name:$version_tag"
docker login -u dev -p Dev57611_Dev57611_Dev57611_Dev57611 $repo_host
docker build -t $image_name_with_tag .
docker push $image_name_with_tag