import { EnumPropertyDefinition, PropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { PropertyDefinitionStub } from './PropertyDefinitionStub';
import { 
  EnumPropertyField, 
  GeoCoordinatePropertyField, 
  NumberPropertyField, 
  TextPropertyField, 
  URIPropertyField 
} from '@/components/PropertyFields';

interface PropertyPreviewProps {

  property: PropertyDefinitionStub;

}

export const PropertyPreview = (props: PropertyPreviewProps) => {

  const stub = props.property;

  const preview = {
    ...stub,
    name: stub.name || '',
  } as PropertyDefinition;

  return (
    <div className="bg-muted px-8 py-4 border-l">
      <h2 className="font-medium">
        Property Preview
      </h2>

      <p className="text-left text-xs leading-relaxed mt-1 mb-12">
        This is how your property will appear when editing an entity in 
        the annotation interface. 
      </p>

      {stub.name && (
        <div className="mt-1" key={preview.name}>
          {preview.type === 'enum' ? (
            <EnumPropertyField 
              id={preview.name}
              definition={preview as EnumPropertyDefinition} />
          ) : preview.type === 'geocoordinate' ? (
            <GeoCoordinatePropertyField 
              id={preview.name}
              definition={preview} />
          ) : preview.type === 'number' ? (
            <NumberPropertyField 
              id={preview.name}
              definition={preview} />   
          ) : preview.type === 'text' ? (
            <TextPropertyField 
              id={preview.name}
              definition={preview} />   
          ) : preview.type === 'uri' ? (
            <URIPropertyField 
              id={preview.name}
              definition={preview} />   
          ) : (
            <Label 
              className="text-xs block mt-3 mb-1.5">
              {preview.name}
            </Label>
          )}

          {preview.description && (
            <p className="text-xs text-muted-foreground mt-2">
              {preview.description}
            </p>
          )}
        </div>
      )}
    </div>
  )

}