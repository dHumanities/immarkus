import { FormEvent, useState } from 'react';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { AnnotationBody, ImageAnnotation, W3CAnnotationBody, createBody } from '@annotorious/react';
import { EntityBadge } from '@/components/EntityBadge';
import { PropertyValidation } from '@/components/PropertyFields';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { createSafeKeys } from './PropertyKeys';
import { Note } from '../Note';
import { PropertiesFormSection, PropertiesFormSectionActions } from '../PropertiesFormSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';
import { Separator } from '@/ui/Separator';
import { PropertiesFormActions } from './PropertiesFormActions';

interface PropertiesFormProps {

  annotation: ImageAnnotation;

  onAddTag(): void;

}

export const PropertiesForm = (props: PropertiesFormProps) => {

  const { annotation } = props;

  const anno = useAnnotoriousManifold();

  const model = useDataModel();

  // Annotation bodies with purpose 'classifying' that have schemas
  const schemaBodies = (annotation.bodies as unknown as W3CAnnotationBody[])
    .filter(b => b.purpose === 'classifying')
    .map(body => ({ body, entityType: model.getEntityType(body.source, true) }));

  // Note body, if any
  const note = annotation.bodies.find(b => b.purpose === 'commenting');

  // All other bodies
  const otherBodies = annotation.bodies.filter(b => b.purpose !== 'classifying');

  const safeKeys = createSafeKeys(schemaBodies);

  const noteKey = `${annotation.id}@note`;

  const getInitialValues = () => schemaBodies.reduce((initialValues, { entityType, body }) => ({
    ...initialValues,
    ...Object.fromEntries((entityType.properties || []).map(property => ([
      safeKeys.getKey(body, property.name), 
      'properties' in body ? body.properties[property.name] : undefined 
    ]))),
  }), { [noteKey]: note?.value });

  const [formState, setFormState] = useState<{[key: string]: any}>(getInitialValues());

  const [valid, setIsValid] = useState(false);

  const [showValidationErrors, setShowValidationErrors] = useState(false); 

  const onDeleteBody = (body: W3CAnnotationBody) =>
    anno.deleteBody(body as unknown as AnnotationBody);
 
  const onChange = (key: string, value: any) =>
    setFormState(state => ({
      ...state, 
      [key]: value
    }));

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (valid) {
      const updatedEntityTags = schemaBodies.map(({ body }) => {
        const properties = Object.entries(formState).reduce((properties, [key, value]) => {
          const name = safeKeys.getName(key);
  
          // This will return undefined if this key is not in this body
          const expectedKey = safeKeys.getKey(body, name);
  
          if (expectedKey == key)
            return { ...properties, [name as string]: value };
          else
            return properties;
        }, {});
  
        return { annotation: props.annotation.id, ...body, properties } as unknown as AnnotationBody;
      });
  
      const noteBody: AnnotationBody = formState[noteKey] && createBody(annotation, {
        type: 'TextualBody',
        purpose: 'commenting',
        value: formState[noteKey]
      });
  
      let updatedAnnotation = {
        ...anno.getAnnotation(annotation.id),
        bodies: noteBody 
          ? [...updatedEntityTags, ...otherBodies, noteBody ]
          : [...updatedEntityTags, ...otherBodies ]
      };
  
      anno.updateAnnotation(updatedAnnotation);
    } else {
      setShowValidationErrors(true);
    }
  }

  const hasSchemaFields = (body: W3CAnnotationBody) => {
    if (body.source) {
      const schema = model.getEntityType(body.source);
      return (schema?.properties || []).length > 0;
    }
  }

  return (
    <PropertyValidation
      showErrors={showValidationErrors}
      onChange={setIsValid}>

      <form className="grow pt-3 flex flex-col" onSubmit={onSubmit}>
        <div className="flex-grow">
          {schemaBodies.length > 0 && schemaBodies.length === 1 ? (
            <div>
              <div className="flex justify-between items-center pb-4">
                <EntityBadge entityType={schemaBodies[0].entityType} />

                <PropertiesFormSectionActions 
                  entityType={schemaBodies[0].entityType} 
                  onDeleteBody={() => onDeleteBody(schemaBodies[0].body)} />
              </div>

              <PropertiesFormSection 
                body={schemaBodies[0].body}
                entityType={schemaBodies[0].entityType}
                safeKeys={safeKeys}
                values={formState} 
                onChange={onChange} />

              <Separator />
            </div>
          ) : (
            <Accordion type="multiple">
              {schemaBodies.map(({ body, entityType }) => hasSchemaFields(body) ? (
                <AccordionItem 
                  key={body.id} 
                  value={body.id}>

                  <div className="flex justify-between items-center">
                    <div className="flex-grow">
                      <AccordionTrigger >
                        <EntityBadge entityType={entityType} />
                      </AccordionTrigger>
                    </div>

                    <PropertiesFormSectionActions 
                      entityType={entityType} 
                      onDeleteBody={() => onDeleteBody(body)} />
                  </div>

                  <AccordionContent>
                    <PropertiesFormSection
                      body={body}
                      entityType={entityType}
                      safeKeys={safeKeys}
                      values={formState}
                      onChange={onChange} />
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div
                  key={body.id}
                  className="flex py-4 justify-between items-center border-b">
                  <EntityBadge entityType={entityType} />
                  <PropertiesFormSectionActions 
                    entityType={entityType} 
                    onDeleteBody={() => onDeleteBody(body)} />
                </div>
              ))}
            </Accordion>
          )}

          <PropertiesFormActions 
            onAddTag={props.onAddTag} />



          {/*

          <Note
            id={noteKey}
            value={formState[noteKey]}
            onChange={value => onChange(noteKey, value)} />
              
          */}
        </div>

        <Button className="w-full" type="submit">Save</Button> 
      </form>
    </PropertyValidation>
  )
  
}