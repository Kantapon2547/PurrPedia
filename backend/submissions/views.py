from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser])
def index(request):
    if request.method == 'GET':
        return Response({"message": "Submissions API working"})

    elif request.method == 'POST':
        name = request.data.get('name')
        description = request.data.get('description')
        image = request.FILES.get('image')  # 👈 important

        return Response({
            "message": "Submission received",
            "name": name,
            "description": description,
            "image_name": image.name if image else None
        })